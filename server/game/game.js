const helpers = require('./gameHelpers.js');
const constants = require('./constants.js');

class Game {
  constructor(room, sendToRoom, sendToPlayer) {
    this.sendToRoom = sendToRoom;
    this.sendToPlayer = sendToPlayer;
    this.players = helpers.buildGamePlayers(room.players);
    this.IDToPlayer = helpers.buildIDToPlayer(this.players);
    this.currentPlayer = null;
    this.currentPlayerIndex = 0;
    this.currentStatusOfPlay = constants.StatusOfPlay.CHOOSING_ACTION;
    this.currentStatusToText = 'Game Starting';
    this.currentAction = {
      player: null,
      action: null,
      target: null,
      blocker: null,
      blockerDelegate: null,
      challengesComplete: false,
      blocksComplete: false,
      executed: false
    };
    this.currentDiscardingPlayer = null;
    this.deck = helpers.buildDeck();
    this.votes = 0;
  }

  // starting game
  startNewGame() {
    this.currentPlayer = this.players[0];
    this.currentPlayer.canAct = true;
    this.currentPlayerIndex = 0;
    for (let player of this.players) {
      player.money = 2;
      player.delegates.push(this.deck.pop());
      player.delegates.push(this.deck.pop());
    }
    this.currentStatusToText = 'Waiting for ' + this.currentPlayer.name + ' to make a play';

    this.startTurn();
  }
  // ending game
  checkForEndOfGame() {
    return this.players.filter((p) => p.isAlive).length < 2;
  }
  endGame() {
    console.log('GAME OVER');
  }

  // turn flow
  startTurn() {
    this.sendToRoom('start-turn', this.getGameState());
    for (let player of this.players) {
      this.sendToPlayer('player-state', player, player.socket_id);
    }
  }
  nextTurn() {
    if (this.checkForEndOfGame()) {
      this.endGame();
      return;
    }
    // else
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.currentPlayer = this.players[this.currentPlayerIndex];
    this.currentStatusOfPlay = constants.StatusOfPlay.CHOOSING_ACTION;
    this.currentStatusToText = 'Waiting for ' + this.currentPlayer.name + ' to make a play';

    this.startTurn();
  }

  // game state and game logic
  getGameState() {
    return {
      currentPlayerIndex: this.currentPlayerIndex,
      players: helpers.buildGamePlayersToSendSafe(this.players),
      currentStatusOfPlay: this.currentStatusToText
    };
  }

  // respond to player
  listen(playerSockets) {
    const game = this;
    playerSockets.map((playerSocket) => {
      playerSocket.on('player-action', function (data) {
        game.playerTakesAction(playerSocket, data);
      });
      playerSocket.on('player-challenge', function (data) {
        game.playerChallengeResponse(playerSocket, data);
      });
      playerSocket.on('player-block', function (data) {
        game.playerBlockResponse(playerSocket, data);
      });
      playerSocket.on('player-block-challenge', function (data) {
        game.playerBlockChallengeResponse(playerSocket, data);
      });
      playerSocket.on('request-gamestate', function (data) {
        game.sendGameStateToPlayer(playerSocket, data);
      });
      playerSocket.on('delegate-discard', function (data) {
        game.playerDiscardsDelegate(playerSocket, data);
      });
      playerSocket.on('delegate-exchange', function (data) {
        game.playerExchangesDelegate(playerSocket, data);
      });
    });
  }

  playerTakesAction(playerSocket, data) {
    // check to make sure player is allowed to act
    if (this.StatusOfPlay !== constants.StatusOfPlay.CHOOSING_ACTION) return;
    let player = this.IDToPlayer[playerSocket.id];
    if (player !== this.currentPlayer) return;

    // record the action data
    const action = data.action;
    const target = players[data.targetIndex];

    this.currentAction = {
      player: player,
      action: action,
      target: target,
      blocker: null,
      blockerDelegate: null,
      challengesComplete: false,
      blocksComplete: false,
      executed: false
    };

    this.nextStep();
    // log to players
    this.logAction(action, player, target);
  }

  playerChallengeResponse(playerSocket, data) {
    // player input checks
    if (this.currentStatusOfPlay !== constants.StatusOfPlay.REQUESTING_CHALLENGES) return;
    let player = this.IDToPlayer[playerSocket.id];
    // only let opponents in the room submit
    if (!player || player === this.currentPlayer) return;

    // onto challenge response logic
    if (data.isChallenging) {
      this.currentAction.challengesComplete = true;
      this.resetPlayerVotes();
      const challengeResult = this.resolveChallenge(this.currentAction.player, this.currentAction.action);
      if (challengeResult.wasSuccessful) {
        sendToRoom('challenge-result', {
          wasSuccessful: true
        });
        this.removeDelegate(this.currentPlayer);
      } else {
        sendToRoom('challenge-result', {
          wasSuccessful: false,
          role: challengeResult.role
        });
        this.removeDelegate(player);
      }
    } else {
      player.voted = true;
      if (this.haveAllPlayersVoted()) {
        this.currentAction.challengesComplete = true;
        this.resetPlayerVotes();
        this.nextStep();
      } else {
        this.sendToRoom('player-voted', player.index);
      }
    }
  }

  playerBlockResponse(playerSocket, data) {
    // player input checks
    if (this.currentStatusOfPlay !== constants.StatusOfPlay.REQUESTING_BLOCKS) return;
    let player = this.IDToPlayer[playerSocket.id];
    // only let opponents in the room submit
    if (!player || player === this.currentPlayer) return;

    if (data.isBlocking) {
      this.currentAction.blocksComplete = true;
      this.resetPlayerVotes();
      // go out for challenges to the block
      this.currentStatusOfPlay = constants.StatusOfPlay.REQUESTING_BLOCK_CHALLENGES;
      this.currentAction.blocker = player;
      this.currentAction.blockerDelegate = data.blockingAs;
      this.sendToRoom('block-challenge-request', {
        blockingPlayer: player.index,
        blockingAs: data.blockingAs
      });
    } else {
      player.voted = true;
      if (this.haveAllPlayersVoted()) {
        this.currentAction.blocksComplete = true;
        this.resetPlayerVotes();
        this.nextStep();
      } else {
        this.sendToRoom('player-voted', playerIndex);
      }
    }
  }

  playerBlockChallengeResponse(playerSocket, data) {
    // player input checks
    if (this.currentStatusOfPlay !== constants.StatusOfPlay.REQUESTING_BLOCKS) return;
    let player = this.IDToPlayer[playerSocket.id];
    // only let opponents in the room submit
    if (!player || player === this.currentAction.blocker) return;

    if (data.isChallenging) {
      this.resetPlayerVotes();

      // resolve the challenge
      const challengeResult = this.resolveChallenge(this.currentAction.blocker, this.currentAction.action);
      if (challengeResult.wasSuccessful) {
        sendToRoom('challenge-result', {
          wasSuccessful: true
        });
        this.removeDelegate(this.currentAction.blocker);
      } else {
        sendToRoom('challenge-result', {
          wasSuccessful: false,
          role: challengeResult.role
        });
        this.removeDelegate(player);
      }
    } else {
      player.voted = true;
      if (this.haveAllPlayersVoted()) {
        this.resetPlayerVotes();
        this.nextStep();
      } else {
        this.sendToRoom('player-voted', player.index);
      }
    }
  }

  playerDiscardsDelegate(playerSocket, data) {
    // player input checks
    if (this.currentStatusOfPlay !== constants.StatusOfPlay.DISCARDING_DELEGATE) return;
    let player = this.IDToPlayer[playerSocket.id];
    // only let opponents in the room submit
    if (!player || player !== this.currentDiscardingPlayer) return;
  }

  playerExchangesDelegate(playerSocket, data) {
    // player input checks
    if (this.currentStatusOfPlay !== constants.StatusOfPlay.EXCHANGING_DELEGATES) return;
    let player = this.IDToPlayer[playerSocket.id];
    // only let opponents in the room submit
    if (!player || player !== this.currentPlayer) return;
  }

  onPlayerDisconnected(playerSocket) {
    let player = this.IDToPlayer[playerSocket.id];
    if (!player) return;

    // check them off as inactive
    // if they're the last one to respond to a block or challenge, set them to pass
    // if they're discarding, autodiscard one for them
    // if they're exchanging, pick two and continue
    // etc.

    // then fix some logic to have them get skipped from now on

    // send to other players that they've left
  }

  nextStep() {
    const actionObj = constants.Actions(this.currentAction.action);

    // first, we check if we've done our challenges
    if (actionObj.isChallengable && !this.currentAction.challengesComplete) {
      this.sendToRoom('challenge-request', {
        playerIndex: player.index,
        targetIndex: target.index || null,
        action: action
      });
      return;
    }

    // then, we check if we've done our blocks
    if (actionObj.blockableBy.length > 0 && !this.currentAction.blocksComplete) {
      this.sendToRoom('block-request', {
        playerIndex: player.index,
        targetIndex: target.index || null,
        action: action
      });
      return;
    }

    if (!this.currentAction.executed) {
      // otherwise, we execute the action
      this.executeAction(this.currentAction.action, this.currentAction.player, this.currentAction.target);
      return;
    }

    // otherwise
    this.nextTurn();
  }

  // helpers

  executeAction(action, player, target) {
    if (!action || !player) return;
    this.currentAction.executed = true;

    switch (action) {
      case 'income':
        player.money += 1;
        this.nextTurn();
        break;
      case 'foreign_aid':
        player.money += 2;
        this.nextTurn();
        break;
      case 'coup':
        if (!target) return;

        this.removeDelegate(target);
        // next turn will be called in remove delegate or on response from the target
        break;
      case 'tax':
        player.money += 3;
        this.nextTurn();
        break;
      case 'assassinate':
        if (!target) return;

        this.removeDelegate(target);
        // next turn will be called in remove delegate or on response from the target
        break;
      case 'exchange':
        const twoCards = [this.deck.pop(), this.deck.pop()];
        this.currentStatusOfPlay = constants.StatusOfPlay.EXCHANGING_DELEGATES;
        this.sendToPlayer('exchange-delegate-choices', twoCards);
        break;
      case 'steal':
        if (!target) return;

        const stolen = Math.min(target.money, 2);
        target.money -= stolen;
        player.money += stolen;
        this.nextTurn();
        break;
      default:
        throw Error('action not found');
    }
  }

  resolveChallenge(player, action) {
    let isCounterAction = false;
    const actionObj = constants.Actions[action];
    if (!actionObj) {
      isCounterAction = true;
      actionObj = constants.CounterActions[action];
    }
    if (!actionObj) throw Error('action not found');

    if (!isCounterAction) {
      if (player.delegates.includes(actionObj.delegate)) {
        return {
          wasSuccessful: false
        };
      } else {
        return {
          wasSuccessful: true
        };
      }
    } else {
      if (player.delegates.includes(this.currentAction.blockerDelegate)) {
        return {
          wasSuccessful: false
        };
      } else {
        return {
          wasSuccessful: true
        };
      }
    }
  }

  removeDelegate(player) {
    if (player.delegates > 1) {
      this.currentStatusOfPlay = constants.StatusOfPlay.DISCARDING_DELEGATE;
      this.currentDiscardingPlayer = player;
      this.sendToRoom('status-update', 'Waiting on ' + player.name + ' to discard an influence');
      this.sendToPlayer(player.socket_id, 'choose-influence');
      // no next turn, need them to choose a card to discard
    } else {
      player.isAlive = false;
      this.deck.push(player.delegates.pop());
      helpers.shuffle(this.deck);
      this.nextStep();
    }
  }

  sendGameStateToPlayer(playerSocket, data) {
    playerSocket.emit('game-state', this.getGameState());

    const player = this.players.find((p) => p.socket_id === playerSocket.id);
    this.sendToPlayer('player-state', player, playerSocket.id);
  }

  logAction(action, player, target) {
    let log = player.name + ' used ' + action;
    if (target) log = log + ' on ' + target.name;
    sendToRoom('log', log);
  }

  haveAllPlayersVoted() {
    for (let player of gamePlayers) {
      if (!player.voted && player.isAlive) return false;
    }
    return true;
  }

  resetPlayerVotes() {
    for (let player of gamePlayers) {
      player.voted = false;
    }
  }
}

module.exports = Game;
