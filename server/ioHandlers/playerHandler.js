// internal
const roomMan = require('../managers/roomManager.js');
const gameMan = require('../managers/gameManager.js');

module.exports = (io, playerSocket) => {
  const createNewRoom = (data) => {
    const room = roomMan.createNewRoomAddPlayer(data.roomname, data.username, playerSocket, io);

    playerSocket.emit('you-joined-room', room.id);
    io.emit('rooms-update', roomMan.getOpenRooms());
  };

  const joinRoom = (data) => {
    const room = roomMan.getRoom(data.room_id);
    roomMan.addPlayerToRoom(room, data.username, playerSocket);

    playerSocket.emit('you-joined-room', room.id);
    io.emit('rooms-update', roomMan.getOpenRooms());
  };

  const leaveRoom = () => {
    roomMan.removePlayerFromTrackedRoom(playerSocket);

    playerSocket.emit('you-left-room');
    io.emit('rooms-update', roomMan.getOpenRooms());
  };

  const startGame = (data) => {
    const room = roomMan.getRoom(data.room_id);
    // make sure this is a player actually in the room!
    if (!room.players.find((p) => p.id === playerSocket.id)) return;

    gameMan.startGame(room, io);

    io.emit('rooms-update', roomMan.getOpenRooms());
  };

  const playerDisconnected = () => {
    roomMan.removePlayerFromTrackedRoom(playerSocket);
  };

  // on join, this will be sent
  io.emit('rooms-update', roomMan.getOpenRooms());

  // and these will be assigned
  playerSocket.on('request-new-room', createNewRoom);
  playerSocket.on('request-join-room', joinRoom);
  playerSocket.on('request-leave-room', leaveRoom);
  playerSocket.on('request-start-game', startGame);
  playerSocket.on('disconnect', playerDisconnected);
};
