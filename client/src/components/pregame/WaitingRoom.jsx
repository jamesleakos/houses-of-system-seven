/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';

const WaitingRoom = ({ room }) => {
  return (
    <div>
      <input type='button' value='Toggle Ready' />
      {room.players.map((player) => {
        return (
          <div>
            <p>{player.name}</p>
            <p>{player.status}</p>
          </div>
        );
      })}
    </div>
  );
};

export default WaitingRoom;
