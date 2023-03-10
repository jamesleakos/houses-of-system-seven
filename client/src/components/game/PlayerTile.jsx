import React from 'react';

// internal
import './styles/PlayerTile.css';

const PlayerTile = ({ player, isCurrentPlayer, choosableTarget, handleClick, isMobile, displayIndex }) => {
  return (
    <div
      className={
        'game-player-tile' +
        (isCurrentPlayer ? ' current-player' : '') +
        (choosableTarget ? ' potential-target' : '') +
        (player.isAlive ? ' alive' : ' dead') +
        (isMobile ? ' mobile' : '')
      }
      onClick={() => {
        if (choosableTarget) {
          handleClick(player.index);
        }
      }}
      style={isMobile ? { gridColumn: (displayIndex % 2) + 1 } : {}}
    >
      <h3 className="player-name">{player.name}</h3>
      <p>{'Gold: ' + player.money}</p>
      <p>{(!isMobile ? 'Delegates Remaining: ' : 'Delegates: ') + player.delegates_count} </p>
    </div>
  );
};

export default PlayerTile;
