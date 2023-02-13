/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import RoomTile from './RoomTile.jsx';

import './styles/Lobby.css';

const Lobby = ({ rooms, createRoom, joinRoom }) => {
  return (
    <div>
      <input
        className='new-room-button'
        type='button'
        value='New Game'
        onClick={createRoom}
      />
      <div className='rooms-area'>
        {rooms.map((room) => {
          return <RoomTile key={room.id} room={room} joinRoom={joinRoom} />;
        })}
      </div>
    </div>
  );
};

export default Lobby;
