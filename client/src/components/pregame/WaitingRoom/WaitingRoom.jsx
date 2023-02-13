// dependancies
import React from 'react';

// imports
import PlayerTile from './PlayerTile.jsx';
import './styles/WaitingRoom.css';

const WaitingRoom = ({ room, leaveRoom, startGame }) => {
  return (
    <div className='waiting-room'>
      <input type='button' value='Start Game' onClick={startGame} />
      <input type='button' value='Leave Room' onClick={leaveRoom} />
      <h3>Players</h3>
      {room.players.map((player) => {
        return <PlayerTile key={player.id} player={player} />;
      })}
    </div>
  );
};

export default WaitingRoom;
