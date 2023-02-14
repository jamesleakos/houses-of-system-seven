const { v4: uuidv4 } = require('uuid');

let rooms = [];
const playerToRoom = {};

const getRoom = (roomID) => {
  return rooms.find((r) => r.id === roomID);
};

const getOpenRooms = () => {
  return rooms.filter((room) => {
    return !room.started && !room.game;
  });
};

const createRoom = (roomname, io) => {
  const newRoom = {
    id: uuidv4(),
    name: roomname,
    players: [],
    started: false,
  };

  // if the room ever becomes empty, it should be deleted
  rooms.push(newRoom);
  // let checkEmptyInterval = setInterval(() => {
  //   let toDelete = true;
  //   newRoom.players.forEach((player) => {
  //     if (!!io.sockets.sockets.get(player.id)) toDelete = false;
  //   });
  //   if (toDelete) {
  //     const index = rooms.indexOf(newRoom);
  //     if (index !== -1) rooms = rooms.splice(index, 1);
  //     clearInterval(checkEmptyInterval);
  //     console.log('room deleted');
  //   }
  // }, 10000);

  return newRoom;
};

const addPlayerToRoom = (room, username, playerSocket) => {
  // don't let a player join a room they're already in
  if (room.players.find((p) => p.id === playerSocket.id)) return;

  // remove from an old rooms they might be in
  removePlayerFromTrackedRoom(playerSocket);

  // add to io namespace
  playerSocket.join(room.id);

  // add to new room
  room.players.push({
    id: playerSocket.id,
    name: username,
  });
  playerToRoom[playerSocket.id] = room;
};

const removePlayerFromRoom = (room, playerSocket) => {
  // remove from room
  room.players = room.players.filter((p) => p.id !== playerSocket.id);
  // remove from playerToRoom tracker
  delete playerToRoom[playerSocket.id];
  //unsub from room messages
  playerSocket.leave(room.id);

  //
  cleanupEmptyRooms();
};

const removePlayerFromTrackedRoom = (playerSocket) => {
  const oldRoom = playerToRoom[playerSocket.id];
  if (oldRoom) removePlayerFromRoom(oldRoom, playerSocket);
};

const cleanupEmptyRooms = () => {
  rooms = rooms.filter((r) => r.players.length > 0);
};

// new room on player request, player gets added
const createNewRoomAddPlayer = (roomname, username, playerSocket, io) => {
  const room = createRoom(roomname, io);
  addPlayerToRoom(room, username, playerSocket);
  return room;
};

module.exports.getRoom = getRoom;
module.exports.getOpenRooms = getOpenRooms;
module.exports.addPlayerToRoom = addPlayerToRoom;
module.exports.createNewRoomAddPlayer = createNewRoomAddPlayer;
module.exports.removePlayerFromTrackedRoom = removePlayerFromTrackedRoom;
