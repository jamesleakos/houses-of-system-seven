import React from 'react';

// internal
import './styles/PlayerTile.css';

const PlayerTile = ({ player, isCurrentPlayer, choosableTarget, handleClick }) => {
  return (
    <div
      className={
        'game-player-tile' +
        (isCurrentPlayer ? ' current-player' : '') +
        (choosableTarget ? ' potential-target' : '') +
        (player.isAlive ? ' alive' : ' dead')
      }
      onClick={() => {
        if (choosableTarget) {
          handleClick(player.index);
        }
      }}
    >
      <h3 className="player-name">{player.name}</h3>
      <p>{'Money: ' + player.money}</p>
      <p>{'Delegates Remaining: ' + player.delegates_count} </p>
    </div>
  );
};

export default PlayerTile;
