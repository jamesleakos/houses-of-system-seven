class Game {
  constructor(room, sendToRoomCallback) {
    console.log('Game constuctor');
    this.sendToRoom = sendToRoomCallback;
    this.players = room.players;
    this.room_id = room.id;
  }

  // messages
  listen(playerSockets) {
    const game = this;
    playerSockets.map((playerSocket) => {
      playerSocket.on('pass-action', function (data) {
        game.playerPassedAction(playerSocket, data);
      });
      playerSocket.on('request-next-turn', function (data) {
        game.playerRequestedNextTurn(playerSocket, data);
      });
    });
  }

  playerPassedAction(playerSocket, data) {
    console.log('passed action this: ' + this);
    this.sendToRoom('player-passed');
  }

  playerRequestedNextTurn(playerSocket, data) {
    console.log('player requested the next turn');
    this.sendToRoom('next-turn');
  }
}

module.exports = Game;
