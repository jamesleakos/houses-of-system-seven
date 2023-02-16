const helpers = require('./gameHelpers.js');

class Game {
  constructor(room, sendToRoom, sendToPlayer) {
    this.sendToRoom = sendToRoom;
    this.sendToPlayer = sendToPlayer;
    this.players = helpers.buildGamePlayers(room.players);
    this.IDToPlayer = helpers.buildIDToPlayer(this.players);
    this.currentPlayer = null;
    this.currentPlayerIndex = 0;
    (this.currentStatusOfPlay = 'choosing-action'), (this.currentStatusToText = 'Game Starting');
    this.currentActionAttempted = {
      actingPlayer: null,
      action: null,
      targetPlayer: null
    };
    this.deck = helpers.buildDeck();
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
    this.currentPlayer.canAct = true;
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
      playerSocket.on('pass-action', function (data) {
        game.playerPassedAction(playerSocket, data);
      });
      playerSocket.on('do-action', function (data) {
        game.playerTakesAction(playerSocket, data);
      });
      playerSocket.on('request-gamestate', function (data) {
        game.sendGameStateToPlayer(playerSocket, data);
      });
    });
  }

  sendGameStateToPlayer(playerSocket, data) {
    playerSocket.emit('game-state', this.getGameState());

    const player = this.players.find((p) => p.socket_id === playerSocket.id);
    this.sendToPlayer('player-state', player, playerSocket.id);
  }

  playerTakesAction(playerSocket, data) {
    console.log('player taking action');

    // check to make sure player is allowed to act
    let player = this.IDToPlayer[playerSocket.id];
    if (player !== this.currentPlayer) return;
    if (!player.canAct) return;

    // execute the action
    const action = data.action;
    const target = players[data.targetIndex];
    this.logAction(action, player, target);

    if (helpers.Actions[action].isChallengeable) {
      // go out to peeps
    } else {
      // execute action
    }
  }

  playerPassedAction(playerSocket, data) {
    console.log('passed action this: ' + this);
    this.sendToRoom('player-passed');
  }

  executeAction(action, player, target) {
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
        this.removeDelegate(target);
        // next turn will be called in remove delegate or on response from the target
        break;
      case 'tax':
        player.money += 3;
        this.nextTurn();
        break;
      case 'assassinate':
        this.removeDelegate(target);
        // next turn will be called in remove delegate or on response from the target
        break;
      case 'exchange':
        const twoCards = [this.deck.pop(), this.deck.pop()];
        this.currentStatusOfPlay = 'exchanging-delegates';
        this.sendToPlayer('exchange-delegate-choices', twoCards);
        break;
      case 'steal':
        const stolen = Math.min(target.money, 2);
        target.money -= stolen;
        player.money += stolen;
        this.nextTurn();
        break;
      default:
        throw Error('action not found');
    }
  }

  removeDelegate(player) {
    if (player.delegates > 1) {
      this.currentStatusOfPlay('choosing-delegate-discard');
      this.sendToRoom('status-update', 'Waiting on ' + player.name + ' to discard an influence');
      this.sendToPlayer(player.socket_id, 'choose-influence');
      // no next turn, need them to choose a card to discard
    } else {
      player.isAlive = false;
      this.removeTargetDelegate(player, 0);
      this.nextTurn();
    }
  }

  logAction(action, player, target) {
    let log = player.name + ' used ' + action;
    if (target) log = log + ' on ' + target.name;
    sendToRoom('log', log);
  }
}

module.exports = Game;
