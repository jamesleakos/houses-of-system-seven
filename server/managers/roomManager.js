const { v4: uuidv4 } = require('uuid');
const Tracking = require('../db/controllers/tracking.js');

class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class Room {
  constructor(name) {
    this.id = uuidv4();
    this.name = name;
    this.players = [];
    this.started = false;
  }

  addPlayer(player) {
    if (this.players.find((p) => p.id === player.id)) return;
    this.players.push(player);
  }

  removePlayer(playerId) {
    this.players = this.players.filter((p) => p.id !== playerId);
  }
}

class RoomManager {
  constructor() {
    this.rooms = [];
    this.playerToRoom = {};
  }

  getRoom(roomID) {
    return this.rooms.find((r) => r.id === roomID);
  }

  getOpenRooms() {
    return this.rooms.filter((room) => {
      return !room.started && !room.game;
    });
  }

  createRoom(roomname) {
    // make sure to cleanup
    this.cleanupEmptyRooms();

    const newRoom = new Room(roomname);
    this.rooms.push(newRoom);
    return newRoom;
  }

  addPlayerToRoom(room, username, playerSocket) {
    // track that we added a new player
    Tracking.addUser(username.slice(0, 10));

    // don't let a player join a room they're already in
    if (room.players.find((p) => p.id === playerSocket.id)) return;

    // remove from an old rooms they might be in
    this.removePlayerFromTrackedRoom(playerSocket);

    // add to io namespace
    playerSocket.join(room.id);

    // add to new room
    room.addPlayer(new Player(playerSocket.id, username.slice(0, 10)));

    this.playerToRoom[playerSocket.id] = room;
  }

  removePlayerFromRoom(room, playerSocket) {
    // remove from room
    room.removePlayer(playerSocket.id);
    // remove from playerToRoom tracker
    delete this.playerToRoom[playerSocket.id];
    //unsub from room messages
    playerSocket.leave(room.id);

    // make sure to cleanup
    this.cleanupEmptyRooms();
  }

  removePlayerFromTrackedRoom(playerSocket) {
    const oldRoom = this.playerToRoom[playerSocket.id];
    if (oldRoom) this.removePlayerFromRoom(oldRoom, playerSocket);
  }

  cleanupEmptyRooms() {
    this.rooms = this.rooms.filter((r) => r.players.length > 0);
  }

  // new room on player request, player gets added
  createNewRoomAddPlayer(roomname, username, playerSocket) {
    // create room
    const room = this.createRoom(roomname);
    this.addPlayerToRoom(room, username, playerSocket);
    return room;
  }
}

const roomMan = new RoomManager();
module.exports = roomMan;
