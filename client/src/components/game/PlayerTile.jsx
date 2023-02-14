import React from 'react';

// internal
import './styles/PlayerTile.css';

const PlayerTile = ({ player }) => {
  return (
    <div className="game-player-tile">
      <h3>{player.name}</h3>
      <p>{'Delegates Remaining: ' + player.delegates_count} </p>
      <p>{'Money: ' + player.money}</p>
    </div>
  );
};

export default PlayerTile;
