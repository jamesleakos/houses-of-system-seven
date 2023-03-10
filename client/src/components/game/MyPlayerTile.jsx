import React from 'react';

// internal
import PlayerDelegate from './PlayerDelegate.jsx';
import './styles/MyPlayerTile.css';

const MyPlayerTile = ({ player, isCurrentPlayer, choosingTarget, isMobile }) => {
  return (
    <div
      className={
        'my-player-tile' +
        (isCurrentPlayer && !choosingTarget ? ' current-player' : '') +
        (player.isAlive ? ' alive' : ' dead') +
        (isMobile ? ' mobile' : '')
      }
    >
      <div className="player-tile-info-area">
        <h3 className="player-name">{player.name + (!isMobile ? ' - YOUR PLAYER' : ' - YOU')}</h3>
        <p>{'Gold: ' + player.money}</p>
      </div>
      {!isMobile ? <p>Your delegates:</p> : null}
      {player.delegates.map((delegate, index) => {
        return <PlayerDelegate key={index} delegate={delegate} style={{ gridColumn: index + 2 }} />;
      })}
    </div>
  );
};

export default MyPlayerTile;
