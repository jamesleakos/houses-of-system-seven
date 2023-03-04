import React from 'react';

// internal
import './styles/PlayerTile.css';

const PlayerTile = ({ player, isCurrentPlayer, choosingTarget, handleClick }) => {
  return (
    <div
      className={'game-player-tile' + (isCurrentPlayer ? ' current-player' : '') + (choosingTarget ? ' potential-target' : '')}
      onClick={() => {
        if (choosingTarget) {
          handleClick(player.index);
        }
      }}
    >
      <h3 className="player-name">{player.name}</h3>
      <p>{'Delegates Remaining: ' + player.delegates_count} </p>
      <p>{'Money: ' + player.money}</p>
    </div>
  );
};

export default PlayerTile;
