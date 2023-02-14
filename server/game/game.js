const helpers = require('./gameHelpers.js');

class Game {
  constructor(room, sendToRoomCallback) {
    this.sendToRoom = sendToRoomCallback;
    this.players = helpers.buildGamePlayers(room.players);
    this.IDToPlayer = helpers.buildIDToPlayer(this.players);
    this.currentPlayer = null;
    this.currentPlayerIndex = 0;
  }

  startTurn() {
    this.sendToRoom('start-turn', {
      currentPlayerIndex: this.currentPlayerIndex,
      players: helpers.buildGamePlayersToSendSafe(this.players)
    });
  }

  startNewGame() {
    this.currentPlayer = this.players[0];
    this.currentPlayer.canAct = true;
    this.currentPlayerIndex = 0;
    this.startTurn();
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

    this.startTurn();
  }

  checkForEndOfGame() {
    return this.players.filter((p) => p.isAlive).length < 2;
  }

  endGame() {
    console.log('GAME OVER');
  }

  // messages
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
    playerSocket.emit('game-state', {
      currentPlayerIndex: this.currentPlayerIndex,
      players: helpers.buildGamePlayersToSendSafe(this.players)
    });
  }

  playerTakesAction(playerSocket, data) {
    console.log('player taking action');
    let player = this.IDToPlayer[playerSocket.id];
    console.log(player);
    console.log(this.currentPlayer);
    if (player !== this.currentPlayer) return;
    if (!player.canAct) return;
    const action = data.action;
    console.log(action);
    this.nextTurn();
  }

  playerPassedAction(playerSocket, data) {
    console.log('passed action this: ' + this);
    this.sendToRoom('player-passed');
  }
}

module.exports = Game;
