import React from 'react';

import './styles/PlayerItem.css';

const RoomTilePlayerItem = ({ player }) => {
  return (
    <div className="room-tile-player-item">
      <p>{player.name}</p>
    </div>
  );
};

export default RoomTilePlayerItem;
