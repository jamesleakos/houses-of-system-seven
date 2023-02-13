const { v4: uuidv4 } = require('uuid');

let rooms = [];
const playerToRoom = {};

const getRoom = (roomID) => {
  return rooms.find((r) => r.id === roomID);
};

const getRooms = () => {
  return rooms;
};

const createRoom = (roomname) => {
  return {
    id: uuidv4(),
    name: roomname,
    players: [],
    started: false,
  };
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
const createNewRoomAddPlayer = (roomname, username, playerSocket) => {
  const room = createRoom(roomname);
  addPlayerToRoom(room, username, playerSocket);
  rooms.push(room);
  return room;
};

module.exports.getRoom = getRoom;
module.exports.getRooms = getRooms;
module.exports.addPlayerToRoom = addPlayerToRoom;
module.exports.createNewRoomAddPlayer = createNewRoomAddPlayer;
module.exports.removePlayerFromTrackedRoom = removePlayerFromTrackedRoom;
