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

    this.sendToRoom('new-game', {});

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
      playerSocket.on('disconnect', function (data) {
        game.onPlayerDisconnected(playerSocket);
      });
    });
  }

  playerTakesAction(playerSocket, data) {
    // check to make sure player is allowed to act
    if (this.currentStatusOfPlay !== constants.StatusOfPlay.CHOOSING_ACTION) return;
    let player = this.IDToPlayer[playerSocket.id];
    if (player !== this.currentPlayer) return;
    // dead men tell no tales
    if (!player.isAlive) return;

    // record the action data
    const action = data.action;
    let target = null;
    if (data.targetIndex !== null && data.targetIndex !== undefined) {
      target = this.players[data.targetIndex];
      if (!target) return;
      if (!target.isAlive) return;
    }

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

    // make the upfront payment
    const actionObj = constants.Actions[this.currentAction.action];
    if (actionObj.upfrontPayment) {
      if (player.money >= actionObj.upfrontPayment) {
        player.money -= actionObj.upfrontPayment;
      } else {
        this.currentAction.canceled = true;
      }
    }

    // log to players
    this.sendToRoom('log', `${player.name} is attempting to use ${action}${!!target ? ' on ' + target.name : ''}`);

    this.nextStep();
  }

  playerChallengeResponse(playerSocket, data) {
    // player input checks
    if (this.currentStatusOfPlay !== constants.StatusOfPlay.REQUESTING_CHALLENGES) return;
    let player = this.IDToPlayer[playerSocket.id];
    // only let opponents in the room submit
    if (!player || player === this.currentPlayer) return;
    // dead men tell no tales
    if (!player.isAlive) return;

    // onto challenge response logic
    if (data.amChallenging) {
      this.currentAction.challengesComplete = true;
      this.resetPlayerVotes();
      const challengeResult = this.resolveChallenge(this.currentAction.player, this.currentAction.action);
      if (challengeResult.wasSuccessful) {
        this.sendToRoom('challenge-result', {
          wasSuccessful: true,
          challengingPlayer: player.index,
          text: `${player.name} successfully challenged ${this.currentAction.player.name}.`
        });
        this.currentAction.canceled = true;
        this.removeDelegate(this.currentPlayer);
      } else {
        this.sendToRoom('challenge-result', {
          wasSuccessful: false,
          role: challengeResult.role,
          challengingPlayer: player.index,
          text: `${player.name} unsuccessfully challenged ${this.currentAction.player.name}.`
        });
        this.removeDelegate(player);
      }
    } else {
      player.voted = true;
      if (this.haveAllPlayersVoted(this.currentAction.player)) {
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
    // dead men tell no tales
    if (!player.isAlive) return;

    // get the action object and check if it can be blocked by the role the player is claiming
    const actionObj = constants.Actions[this.currentAction.action];

    // check to see if the action is only blockable by the target
    // if so, make sure the submitting player is is the target
    if (actionObj.blockableBy.length === 0) return;
    if (actionObj.onlyTargetBlocks && player !== this.currentAction.target) return;

    if (data.amBlocking && actionObj.blockableBy.includes(data.blockingAs)) {
      // update the current action object
      this.currentAction.blocksComplete = true;
      this.resetPlayerVotes();
      this.currentStatusOfPlay = constants.StatusOfPlay.REQUESTING_BLOCK_CHALLENGES;
      this.currentStatusToText = `${player.name} is attempting to block as the ${data.blockingAs}. Waiting for challenges...`;
      this.currentAction.blocker = player;
      this.currentAction.blockerDelegate = data.blockingAs;

      // send the request to the room
      this.sendToRoom('block-challenge-request', {
        blockingPlayer: player.index,
        blockingAs: data.blockingAs,
        currentStatusToText: this.currentStatusToText
      });
    } else {
      player.voted = true;
      if (this.haveAllPlayersVoted(this.currentAction.player) || actionObj.onlyTargetBlocks) {
        this.currentAction.blocksComplete = true;
        this.resetPlayerVotes();
        this.nextStep();
      } else {
        this.sendToRoom('player-voted', player.index);
      }
    }
  }

  playerBlockChallengeResponse(playerSocket, data) {
    // player input checks
    if (this.currentStatusOfPlay !== constants.StatusOfPlay.REQUESTING_BLOCK_CHALLENGES) return;
    let player = this.IDToPlayer[playerSocket.id];
    // only let opponents in the room submit
    if (!player || player === this.currentAction.blocker) return;
    // dead men tell no tales
    if (!player.isAlive) return;

    if (data.amChallenging) {
      this.resetPlayerVotes();

      // resolve the challenge
      const challengeResult = this.resolveBlockChallenge(this.currentAction.blocker, this.currentAction.action);
      if (challengeResult.wasSuccessful) {
        this.sendToRoom('challenge-result', {
          wasSuccessful: true
        });
        this.removeDelegate(this.currentAction.blocker);
      } else {
        this.sendToRoom('challenge-result', {
          wasSuccessful: false,
          role: challengeResult.role
        });
        this.currentAction.canceled = true;
        this.removeDelegate(player);
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
    // dead men tell no tales
    if (!player.isAlive) return;

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
    // dead men tell no tales
    if (!player.isAlive) return;

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
    helpers.shuffle(this.deck);
    this.sentDelegates = [];

    this.nextStep();
  }

  onPlayerDisconnected(playerSocket) {
    let player = this.IDToPlayer[playerSocket.id];
    if (!player) return;

    this.sendToRoom('player-disconnected', `${this.players[player.index].name} has disconnected.`);

    // check them off as inactive
    player.active = false;
    // kill them off, though in the future we may remove this to let them rejoin
    player.isAlive = false;

    // if it's their turn, just move on
    if (player === this.currentPlayer) {
      this.nextTurn();
      return;
    }

    // if they were the target of a action with a blockByTargetOnly option, set them to pass
    // we'll deal with actually moving on in a second
    if (this.currentAction.action === null) return; // need this to avoid errors
    const actionObj = constants.Actions[this.currentAction.action];
    if (actionObj.onlyTargetBlocks && this.currentAction.target === player) {
      this.currentAction.blocksComplete = true;
    }

    // if they were in the middle of stuff
    if (this.currentStatusOfPlay === constants.StatusOfPlay.REQUESTING_CHALLENGES) {
      player.voted = true;
      if (this.haveAllPlayersVoted(this.currentAction.player)) {
        this.resetPlayerVotes();
        this.nextStep();
      }
      return;
    }
    if (this.currentStatusOfPlay === constants.StatusOfPlay.REQUESTING_BLOCKS) {
      player.voted = true;
      if (this.haveAllPlayersVoted(this.currentAction.player) || this.currentAction.target === player) {
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
  }

  // main helpers

  nextStep() {
    const actionObj = constants.Actions[this.currentAction.action];
    if (this.currentAction.canceled) {
      // log to players
      this.sendToRoom(
        'log',
        `${this.currentAction.player.name} did not successfully use ${this.currentAction.action}${
          !!this.currentAction.target ? ' on ' + this.currentAction.target.name : ''
        }`
      );

      this.nextTurn();
      return;
    }

    // first, we check if we've done our challenges
    if (actionObj.isChallengeable && !this.currentAction.challengesComplete) {
      this.currentStatusOfPlay = constants.StatusOfPlay.REQUESTING_CHALLENGES;
      this.currentStatusToText = `${this.currentAction.player.name} is using ${this.currentAction.action}${
        !!this.currentAction.target ? ' on ' + this.currentAction.target.name : ''
      } - Requesting Challenges`;
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
      this.currentStatusToText = `${this.currentAction.player.name} is using ${this.currentAction.action}${
        !!this.currentAction.target ? ' on ' + this.currentAction.target.name : ''
      } - Requesting Blocks`;
      this.currentStatusOfPlay = constants.StatusOfPlay.REQUESTING_BLOCKS;
      this.sendToRoom('block-request', {
        playerIndex: this.currentAction.player.index,
        targetIndex: !!this.currentAction.target ? this.currentAction.target.index : null,
        action: this.currentAction.action,
        currentStatusToText: this.currentStatusToText
      });
      return;
    }

    if (!this.currentAction.executed) {
      // log to players
      this.sendToRoom(
        'log',
        `${this.currentAction.player.name} successfully used ${this.currentAction.action}${
          !!this.currentAction.target ? ' on ' + this.currentAction.target.name : ''
        }`
      );

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

  switchDelegate(player, delegate) {
    const index = player.delegates.indexOf(delegate);
    player.delegates[index] = this.deck.pop();
    this.deck.push(delegate);
    helpers.shuffle(this.deck);
    this.sendToPlayer('player-state', player, player.socket_id);
    this.sendToPlayer(
      'role-changed',
      {
        text: `You revealed ${delegate} to win the challenge. You switched it for a new delegate and now have a ${player.delegates[index]}.`
      },
      player.socket_id
    );
  }

  resolveChallenge(player, action) {
    const actionObj = constants.Actions[action];
    if (!actionObj) throw Error('action not found');

    if (player.delegates.includes(actionObj.delegate)) {
      // switch the player's delegate with a new one from the deck
      this.switchDelegate(player, actionObj.delegate);
      // return
      return {
        wasSuccessful: false
      };
    } else {
      return {
        wasSuccessful: true
      };
    }
  }

  resolveBlockChallenge(blockingPlayer, actionBeingBlocked) {
    const counterActionObj = constants.CounterActions[constants.Actions[actionBeingBlocked].blockAction];
    if (!counterActionObj) throw Error('counter action not found');

    for (let delegate of blockingPlayer.delegates) {
      if (counterActionObj.delegates.includes(delegate)) {
        // switch the player's delegate with a new one from the deck
        this.switchDelegate(blockingPlayer, delegate);
        return {
          wasSuccessful: false
        };
      }
    }

    return {
      wasSuccessful: true
    };
  }

  removeDelegate(player) {
    this.sendToRoom('log', `${player.name} lost a delegate`);
    if (player.delegates.length > 1) {
      // set some state
      this.currentStatusOfPlay = constants.StatusOfPlay.DISCARDING_DELEGATE;
      this.currentDiscardingPlayer = player;
      // send to room
      this.sendToRoom('status-update', {
        currentStatusToText: 'Waiting on ' + player.name + ' to discard a delegate'
      });
      this.sendToPlayer('discard-delegate', {}, player.socket_id);
      // don't go to the next turn, need them to choose a card to discard
    } else {
      this.sendToRoom('log', `${player.name} died!`); // -log

      // remove the player from the game and return their delegate to the deck
      player.isAlive = false;
      this.deck.push(player.delegates.pop());
      helpers.shuffle(this.deck);
      this.sendToPlayer('player-state', player, player.socket_id);

      // check to see if the game is over
      // notably, this will never happen in the previous block, because they already have more than one life
      if (this.checkForEndOfGame()) {
        this.endGame();
      } else {
        this.nextStep();
      }
    }
  }

  playerRequestedGameState(playerSocket, data) {
    const player = this.players.find((p) => p.socket_id === playerSocket.id);
    if (!player) return;

    this.sendGameStateToPlayer(player, 'game-state');
  }

  // other helpers

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
