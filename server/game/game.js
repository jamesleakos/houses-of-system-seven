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
      executed: false,
      canceled: false
    };
    this.currentDiscardingPlayer = null;
    this.deck = helpers.buildDeck();
    this.votes = 0;
    this.sentDelegates = [];
    this.gameOver = false;
  }

  // starting game
  startNewGame() {
    console.log('starting new game');
    this.gameOver = false;
    this.currentPlayer = this.players[0];
    this.currentPlayer.canAct = true;
    this.currentPlayerIndex = 0;
    for (let player of this.players) {
      player.money = 2;
      player.delegates = [this.deck.pop(), this.deck.pop()];
      player.isAlive = true;
      player.voted = false;
      player.active = true;
    }
    this.currentStatusToText = 'Waiting for ' + this.currentPlayer.name + ' to make a play';

    this.startTurn();
  }
  // ending game
  checkForEndOfGame() {
    return this.players.filter((p) => p.isAlive).length < 2;
  }
  endGame() {
    this.gameOver = true;
    this.sendToRoom('end-game', {
      winner: this.players.filter((p) => p.isAlive)[0]?.name,
      players: helpers.buildGamePlayersToSendSafe(this.players)
    });
  }

  // turn flow
  startTurn() {
    this.currentStatusOfPlay = constants.StatusOfPlay.CHOOSING_ACTION;
    this.sendGameStateToPlayers('start-turn');
  }
  nextTurn() {
    if (this.checkForEndOfGame()) {
      this.endGame();
      return;
    }
    // else
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

    // skip past inactive or eliminated players
    while (!this.players[this.currentPlayerIndex].active || !this.players[this.currentPlayerIndex].isAlive) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
    this.currentPlayer = this.players[this.currentPlayerIndex];
    this.currentStatusOfPlay = constants.StatusOfPlay.CHOOSING_ACTION;
    this.currentStatusToText = 'Waiting for ' + this.currentPlayer.name + ' to make a play';

    this.startTurn();
  }

  // sending game state
  sendGameStateToPlayers(message) {
    for (let player of this.players) {
      this.sendGameStateToPlayer(player, message);
    }
  }
  sendGameStateToPlayer(player, message) {
    this.sendToPlayer(
      message,
      {
        player: player,
        currentPlayerIndex: this.currentPlayerIndex,
        players: helpers.buildGamePlayersToSendSafe(this.players),
        currentStatusOfPlay: this.currentStatusOfPlay,
        currentStatusToText: this.currentStatusToText
      },
      player.socket_id
    );
  }

  // respond to player
  listen(playerSockets) {
    const game = this;
    playerSockets.map((playerSocket) => {
      playerSocket.on('player-action', function (data) {
        console.log('player action');
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
        game.playerRequestedGameState(playerSocket, data);
      });
      playerSocket.on('delegate-discard', function (data) {
        game.playerDiscardsDelegate(playerSocket, data);
      });
      playerSocket.on('delegate-exchange', function (data) {
        game.playerExchangesDelegate(playerSocket, data);
      });
      playerSocket.on('request-new-game', function (data) {
        if (!game.gameOver) return;
        game.startNewGame();
      });
    });
  }

  playerTakesAction(playerSocket, data) {
    // check to make sure player is allowed to act
    if (this.currentStatusOfPlay !== constants.StatusOfPlay.CHOOSING_ACTION) return;
    let player = this.IDToPlayer[playerSocket.id];
    if (player !== this.currentPlayer) return;

    console.log('passed intro checks');

    // record the action data
    const action = data.action;
    const target = !!data.targetIndex ? this.gamePlayers[data.targetIndex] : null;

    console.log(action);

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
    if (data.amChallenging) {
      console.log('player is challenging');

      this.currentAction.challengesComplete = true;
      this.resetPlayerVotes();
      const challengeResult = this.resolveChallenge(this.currentAction.player, this.currentAction.action);
      if (challengeResult.wasSuccessful) {
        console.log('challenge was successful');
        this.sendToRoom('challenge-result', {
          wasSuccessful: true
        });
        this.removeDelegate(this.currentPlayer);
        this.currentAction.canceled = true;
      } else {
        console.log('challenge was not successful');
        this.sendToRoom('challenge-result', {
          wasSuccessful: false,
          role: challengeResult.role
        });
        this.removeDelegate(player);
      }
    } else {
      console.log('player is not challenging');
      player.voted = true;
      if (this.haveAllPlayersVoted(this.currentAction.player)) {
        console.log('all players have voted');
        this.currentAction.challengesComplete = true;
        this.resetPlayerVotes();
        this.nextStep();
      } else {
        console.log('not all players have voted yet');
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

    // get the action object and check if it can be blocked by the role the player is claiming
    const actionObj = constants.Actions[this.currentAction.action];

    if (data.amBlocking && actionObj.blockableBy.includes(data.blockingAs)) {
      console.log(`${player.name} is blocking as the ${data.blockingAs}`);
      this.currentAction.blocksComplete = true;
      this.resetPlayerVotes();
      // go out for challenges to the block
      this.currentStatusOfPlay = constants.StatusOfPlay.REQUESTING_BLOCK_CHALLENGES;
      this.currentStatusToText = `${player.name} is attempting to block as the ${data.blockingAs}. Waiting for challenges...`;
      this.currentAction.blocker = player;
      this.currentAction.blockerDelegate = data.blockingAs;
      this.sendToRoom('block-challenge-request', {
        blockingPlayer: player.index,
        blockingAs: data.blockingAs,
        currentStatusToText: this.currentStatusToText
      });
    } else {
      console.log(`${player.name} is not blocking`);
      player.voted = true;
      if (this.haveAllPlayersVoted(this.currentAction.player)) {
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
    if (this.currentStatusOfPlay !== constants.StatusOfPlay.REQUESTING_BLOCK_CHALLENGES) return;
    let player = this.IDToPlayer[playerSocket.id];
    // only let opponents in the room submit
    if (!player || player === this.currentAction.blocker) return;

    if (data.amChallenging) {
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
        this.currentAction.canceled = true;
      }
    } else {
      player.voted = true;
      if (this.haveAllPlayersVoted(this.currentAction.blocker)) {
        this.resetPlayerVotes();
        this.currentAction.canceled = true;
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

    const index = player.delegates.indexOf(data.delegate);
    if (index === -1) {
      this.deck.push(player.delegates.pop());
      helpers.shuffle(this.deck);
    } else {
      player.delegates.splice(index, 1);
      this.deck.push(data.delegate);
      helpers.shuffle(this.deck);
    }
    this.sendToPlayer('player-state', player, player.socket_id);

    this.nextStep();
  }

  playerExchangesDelegate(playerSocket, data) {
    // player input checks
    if (this.currentStatusOfPlay !== constants.StatusOfPlay.EXCHANGING_DELEGATES) return;
    let player = this.IDToPlayer[playerSocket.id];
    // only let opponents in the room submit
    if (!player || player !== this.currentPlayer) return;

    // should probably save the sent delegates somewhere so that we know the player isn't cheating
    const delegateNum = player.delegates.length;
    const picked = data.delegates;
    const pool = [...player.delegates, ...this.sentDelegates];
    player.delegates = [];
    for (let i = 0; i < delegateNum; i++) {
      const index = pool.indexOf(picked[i]);
      if (index !== -1) {
        player.delegates.push(pool[index]);
        pool.splice(index, 1);
      }
      // if the client sent bad info, just pick one
      else {
        player.delegates.push(pool.pop());
      }
    }
    for (let remaining of pool) {
      this.deck.push(remaining);
    }
    this.sentDelegates = [];
  }

  onPlayerDisconnected(playerSocket) {
    let player = this.IDToPlayer[playerSocket.id];
    if (!player) return;

    this.sendToRoom('player-disconnected', player.index);

    // check them off as inactive
    player.active = false;
    // if they're the last one to respond to a block or challenge, set them to pass
    if (
      this.currentStatusOfPlay === constants.StatusOfPlay.REQUESTING_BLOCKS ||
      this.currentStatusOfPlay === constants.StatusOfPlay.REQUESTING_CHALLENGES
    ) {
      player.voted = true;
      if (this.haveAllPlayersVoted(this.currentAction.player)) {
        this.resetPlayerVotes();
        this.nextStep();
      }
      return;
    }
    if (this.currentStatusOfPlay === constants.StatusOfPlay.REQUESTING_BLOCK_CHALLENGES) {
      player.voted = true;
      if (this.haveAllPlayersVoted(this.currentAction.blocker)) {
        this.resetPlayerVotes();
        this.nextStep();
      }
      return;
    }
    // if they're discarding, autodiscard one for them
    if (this.currentStatusOfPlay === constants.StatusOfPlay.DISCARDING_DELEGATE && player === this.currentDiscardingPlayer) {
      this.deck.push(player.delegates.pop());
      helpers.shuffle(this.deck);
      this.nextStep();
      return;
    }
    // if they're exchanging, just keep the ones they have
    if (this.currentStatusOfPlay === constants.StatusOfPlay.EXCHANGING_DELEGATES && player === this.currentDiscardingPlayer) {
      this.deck = [...this.deck, ...this.sentDelegates];
      helpers.shuffle(this.deck);
      this.nextStep();
      return;
    }

    // if it's their turn, just move on
    if (player === this.currentPlayer) {
      this.nextTurn();
      return;
    }
  }

  // main helpers

  nextStep() {
    const actionObj = constants.Actions[this.currentAction.action];
    if (this.currentAction.canceled) {
      this.nextTurn();
      return;
    }

    // first, we check if we've done our challenges
    if (actionObj.isChallengeable && !this.currentAction.challengesComplete) {
      this.currentStatusOfPlay = constants.StatusOfPlay.REQUESTING_CHALLENGES;
      this.currentStatusToText = 'Requesting Challenges';
      this.sendToRoom('challenge-request', {
        playerIndex: this.currentAction.player.index,
        targetIndex: !!this.currentAction.target ? this.currentAction.target.index : -1,
        action: this.currentAction.action,
        currentStatusToText: this.currentStatusToText
      });
      return;
    }

    // then, we check if we've done our blocks
    if (actionObj.blockableBy.length > 0 && !this.currentAction.blocksComplete) {
      console.log('requesting blocks');
      this.currentStatusToText = 'Requesting Blocks';
      this.currentStatusOfPlay = constants.StatusOfPlay.REQUESTING_BLOCKS;
      this.sendToRoom('block-request', {
        playerIndex: this.currentAction.player.index,
        targetIndex: !!this.currentAction.target ? this.currentAction.target.index : null,
        action: this.currentAction.action
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

  executeAction(action, player, target) {
    if (!action || !player) return;
    this.currentAction.executed = true;

    const actionObj = constants.Actions[action];
    if (!actionObj) throw Error('no action found');

    actionObj.execute(this, player, target);
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
    console.log('removing delegate from ' + player.name);
    console.log(player.delegates);
    if (player.delegates.length > 1) {
      this.currentStatusOfPlay = constants.StatusOfPlay.DISCARDING_DELEGATE;
      this.currentDiscardingPlayer = player;
      this.sendToRoom('status-update', {
        currentStatusToText: 'Waiting on ' + player.name + ' to discard an influence'
      });
      this.sendToPlayer('discard-delegate', {}, player.socket_id);
      // no next turn, need them to choose a card to discard
    } else {
      console.log('killing player ' + player.name);
      player.isAlive = false;
      this.deck.push(player.delegates.pop());
      helpers.shuffle(this.deck);
      this.sendToPlayer('player-state', player, player.socket_id);
      this.nextStep();
    }
  }

  playerRequestedGameState(playerSocket, data) {
    const player = this.players.find((p) => p.socket_id === playerSocket.id);
    if (!player) return;

    this.sendGameStateToPlayer(player, 'game-state');
  }

  // other helpers

  logAction(action, player, target) {
    let log = player.name + ' used ' + action;
    if (target) log = log + ' on ' + target.name;
    this.sendToRoom('log', log);
  }

  haveAllPlayersVoted(challengedPlayer) {
    for (let player of this.players.filter((p) => p !== challengedPlayer)) {
      if (!player.voted && player.isAlive) return false;
    }
    return true;
  }

  resetPlayerVotes() {
    for (let player of this.players) {
      player.voted = false;
    }
  }
}

module.exports = Game;
