/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';

const Lobby = ({ rooms, createRoom }) => {
  return (
    <div>
      <input type='button' value='New Game' onClick={createRoom} />
      {rooms.map((room) => {
        return <input type='button' value={'Join ' + room.name} />;
      })}
    </div>
  );
};

export default Lobby;
