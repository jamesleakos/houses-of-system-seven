const Game = require('../game/game.js');

const startGame = async (room, io) => {
  console.log('game man start game');
  const clients = io.sockets.adapter.rooms.get(room.id);
  const sockets = [...clients].map((id) => io.sockets.sockets.get(id));

  room.game = new Game(room, (messageType, data) => {
    sendToRoom(messageType, room.id, data, io);
  });
  room.game.listen(sockets);
  room.started = true;

  io.to(room.id).emit('game-started', room.id);
};

const sendToRoom = (messageType, room_id, data, io) => {
  io.to(room_id).emit(messageType, data);
};

module.exports.startGame = startGame;
