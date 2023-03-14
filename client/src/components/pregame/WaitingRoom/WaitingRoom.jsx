// dependancies
import React from 'react';

// imports
import PlayerTile from './PlayerTile.jsx';
import './styles/WaitingRoom.css';

const WaitingRoom = ({ room, leaveRoom, startGame, isMobile, playHover, playClick }) => {
  const validNumPlayers = function () {
    return room.players.length >= 2 && room.players.length <= 6;
  };
  return (
    <div className={'waiting-room' + (isMobile ? ' mobile' : '')}>
      <div className="waiting-room-bar">
        {!isMobile ? <h3 className="waiting-room-title">{room.name}</h3> : null}
        <div
          className={validNumPlayers() ? 'hoss-button' : 'hoss-button disabled'}
          onClick={() => {
            if (validNumPlayers()) {
              playClick();
              startGame();
            }
          }}
          onMouseEnter={playHover}
        >
          {room.players.length >= 2 && room.players.length <= 6 ? 'START GAME' : '2 - 6 PLAYERS'}
        </div>
        <div
          className="hoss-button leave"
          onClick={() => {
            leaveRoom();
            playClick();
          }}
          onMouseEnter={playHover}
        >
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
