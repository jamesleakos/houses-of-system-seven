import React from 'react';

// internal
import PlayerDelegate from './PlayerDelegate.jsx';
import './styles/MyPlayerTile.css';

const MyPlayerTile = ({ player, isCurrentPlayer, choosingTarget }) => {
  return (
    <div className={'my-player-tile' + (isCurrentPlayer ? ' current-player' : '') + (player.isAlive ? ' alive' : ' dead')}>
      <h3 className="player-name">{player.name + ' - YOUR PLAYER'}</h3>
      <p>{'Money: ' + player.money}</p>
      <p>Your delegates:</p>
      <div className="player-delegates">
        {player.delegates.map((delegate, index) => {
          return <PlayerDelegate key={index} delegate={delegate} />;
        })}
      </div>
    </div>
  );
};

export default MyPlayerTile;
