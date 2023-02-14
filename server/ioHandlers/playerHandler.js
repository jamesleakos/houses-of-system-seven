// internal
const roomMan = require('../managers/roomManager.js');
const gameMan = require('../managers/gameManager.js');

module.exports = (io, player) => {
  const createNewRoom = (data) => {
    const room = roomMan.createNewRoomAddPlayer(
      data.roomname,
      data.username,
      player,
      io
    );

    player.emit('you-joined-room', room.id);
    io.emit('rooms-update', roomMan.getOpenRooms());
  };

  const joinRoom = (data) => {
    const room = roomMan.getRoom(data.room_id);
    roomMan.addPlayerToRoom(room, data.username, player);

    player.emit('you-joined-room', room.id);
    io.emit('rooms-update', roomMan.getOpenRooms());
  };

  const leaveRoom = () => {
    roomMan.removePlayerFromRoom(player);

    player.emit('you-left-room');
    io.emit('rooms-update', roomMan.getOpenRooms());
  };

  const startGame = (data) => {
    console.log('start the game');
    const room = roomMan.getRoom(data.room_id);
    // make sure this is a player actually in the room!
    if (!room.players.find((p) => p.id === player.id)) return;

    gameMan.startGame(room, io);

    io.emit('rooms-update', roomMan.getOpenRooms());
  };

  const playerDisconnected = () => {
    roomMan.removePlayerFromTrackedRoom(player);
  };

  // on join, this will be sent
  io.emit('rooms-update', roomMan.getOpenRooms());

  // and these will be assigned
  player.on('request-new-room', createNewRoom);
  player.on('request-join-room', joinRoom);
  player.on('request-leave-room', leaveRoom);
  player.on('request-start-game', startGame);
  player.on('disconnect', playerDisconnected);
};
