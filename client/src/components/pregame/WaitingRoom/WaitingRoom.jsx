// dependancies
import React from 'react';

// imports
import PlayerTile from './PlayerTile.jsx';
import './styles/WaitingRoom.css';

const WaitingRoom = ({ room, leaveRoom, startGame }) => {
  const validNumPlayers = function () {
    return room.players.length >= 2 && room.players.length <= 6;
  };
  return (
    <div className="waiting-room">
      <div className="waiting-room-bar">
        <h3 className="waiting-room-title">{room.name}</h3>
        <div
          className={validNumPlayers() ? 'hoss-button' : 'hoss-button disabled'}
          onClick={() => {
            if (validNumPlayers()) {
              startGame();
            }
          }}
        >
          {room.players.length >= 2 && room.players.length <= 6 ? 'START GAME' : '2 - 6 PLAYERS'}
        </div>
        <div className="hoss-button" onClick={leaveRoom}>
          LEAVE ROOM
        </div>
      </div>
      <div className="player-list">
        {room.players.map((player) => {
          return <PlayerTile key={player.id} player={player} />;
        })}
      </div>
    </div>
  );
};

export default WaitingRoom;
