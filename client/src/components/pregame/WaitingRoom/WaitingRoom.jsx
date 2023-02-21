// dependancies
import React from 'react';

// imports
import PlayerTile from './PlayerTile.jsx';
import './styles/WaitingRoom.css';

const WaitingRoom = ({ room, leaveRoom, startGame }) => {
  return (
    <div className="waiting-room">
      <h3 className="waiting-room-title">Players</h3>
      <div className="player-list">
        {room.players.map((player) => {
          return <PlayerTile key={player.id} player={player} />;
        })}
      </div>
      <div className="hoss-button" onClick={startGame}>
        START GAME
      </div>
      <div className="hoss-button" onClick={leaveRoom}>
        LEAVE ROOM
      </div>
    </div>
  );
};

export default WaitingRoom;
