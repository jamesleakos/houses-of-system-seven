import React from 'react';

// internal
import PlayerDelegate from './PlayerDelegate.jsx';
import './styles/MyPlayerTile.css';

const MyPlayerTile = ({ player, isCurrentPlayer }) => {
  return (
    <div className={isCurrentPlayer ? 'my-player-tile current-player' : 'my-player-tile'}>
      <h3 className="player-name">{player.name}</h3>
      <p>{'Money: ' + player.money}</p>
      <div className="player-delegates">
        {player.delegates.map((delegate, index) => {
          return <PlayerDelegate key={index} delegate={delegate} />;
        })}
      </div>
    </div>
  );
};

export default MyPlayerTile;
