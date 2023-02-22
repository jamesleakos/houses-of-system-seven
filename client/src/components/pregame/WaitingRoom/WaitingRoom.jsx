// dependancies
import React from 'react';

// imports
import PlayerTile from './PlayerTile.jsx';
import './styles/WaitingRoom.css';

const WaitingRoom = ({ room, leaveRoom, startGame }) => {
  return (
    <div className="waiting-room">
      <div className="waiting-room-bar">
        <h3 className="waiting-room-title">{room.name}</h3>
        <div className="hoss-button" onClick={startGame}>
          START GAME
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
