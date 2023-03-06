import React from 'react';

// internal
import './styles/PlayerTile.css';

const PlayerTile = ({ player, isCurrentPlayer, choosingTarget, handleClick }) => {
  console.log('player tile player');
  console.log(player);
  return (
    <div
      className={
        'game-player-tile' +
        (isCurrentPlayer ? ' current-player' : '') +
        (choosingTarget ? ' potential-target' : '') +
        (player.isAlive ? ' alive' : ' dead')
      }
      onClick={() => {
        if (choosingTarget) {
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
