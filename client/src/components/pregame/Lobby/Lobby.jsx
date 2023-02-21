/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import RoomTile from './RoomTile.jsx';

import './styles/Lobby.css';

const Lobby = ({ rooms, createRoom, joinRoom }) => {
  return (
    <div className="lobby">
      <h1 className="lobby-title">Open Rooms</h1>
      <div className="new-room-button hoss-button" onClick={createRoom}>
        NEW GAME
      </div>
      <div className="rooms-area">
        {rooms.map((room) => {
          return <RoomTile key={room.id} room={room} joinRoom={joinRoom} />;
        })}
      </div>
    </div>
  );
};

export default Lobby;
