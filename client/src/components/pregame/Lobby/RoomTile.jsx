import React from 'react';

import RoomTilePlayerItem from './PlayerItem.jsx';
import './styles/RoomTile.css';

const RoomTile = ({ room, joinRoom }) => {
  return (
    <div
      className='room-tile'
      onClick={() => {
        joinRoom(room.id);
      }}
    >
      <h3>{room.name}</h3>
      {room.players.map((player) => {
        return <RoomTilePlayerItem key={player.id} player={player} />;
      })}
    </div>
  );
};

export default RoomTile;
