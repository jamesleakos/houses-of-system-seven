const Game = require('../game/game.js');
const Tracking = require('../db/controllers/tracking.js');

const startGame = async (room, io) => {
  if (room.players.length < 2 || room.players.length > 6) {
    throw new Error('Invalid number of players');
  }
  // track the game in the db
  Tracking.addGame(room.players.map((p) => p.name));

  const clients = io.sockets.adapter.rooms.get(room.id);
  const sockets = [...clients].map((id) => io.sockets.sockets.get(id));

  room.game = new Game(
    room,
    (messageType, data) => {
      sendToRoom(messageType, room.id, data, io);
    },
    (messageType, data, playerSocketID) => {
      sendToPlayer(messageType, data, playerSocketID, io);
    }
  );
  room.game.listen(sockets);
  room.game.startNewGame();
  room.started = true;

  io.to(room.id).emit('game-started', room.id);
};

const sendToRoom = (messageType, room_id, data, io) => {
  io.to(room_id).emit(messageType, data);
};

const sendToPlayer = (messageType, data, playerSocketID, io) => {
  const client = io.sockets.sockets.get(playerSocketID);
  if (client) client.emit(messageType, data);
};

module.exports.startGame = startGame;
