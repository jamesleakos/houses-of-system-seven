import React from 'react';

import RoomTilePlayerItem from './PlayerItem.jsx';
import './styles/RoomTile.css';

const RoomTile = ({ room, joinRoom, playHover, playClick }) => {
  return (
    <div
      className="room-tile"
      onClick={() => {
        playClick();
        joinRoom(room.id);
      }}
      onMouseEnter={playHover}
    >
      <h3>{room.name}</h3>
      {room.players.map((player) => {
        return <RoomTilePlayerItem key={player.id} player={player} />;
      })}
    </div>
  );
};

export default RoomTile;
