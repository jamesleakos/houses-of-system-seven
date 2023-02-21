import React from 'react';

import './styles/PlayerTile.css';

const PlayerTile = ({ player }) => {
  return (
    <div className="waiting-room-player-tile">
      <h3>{player.name}</h3>
    </div>
  );
};

export default PlayerTile;
