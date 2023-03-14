/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';

import './styles/EnterNameRoom.css';

const EnterNameRoom = ({ setUsername, isMobile, playHover, playClick }) => {
  const [name, setName] = useState('');

  const handleClick = function () {
    setUsername(name);
    setName('');
    playClick();
  };

  return (
    <div className={'enter-name-room' + (isMobile ? ' mobile' : '')}>
      <h1 className="game-title-small">THE NOBLE HOUSES OF</h1>
      <br />
      <h1 className="game-title-large">SYSTEM SEVEN</h1>
      <br />
      <div className="input-area">
        <h2 className="enter-name-title">Enter Player Name</h2>
        <input
          className="text-field"
          type="text"
          placeholder="Player Name"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <input className="submit-button" type="button" value=">" onMouseEnter={playHover} onClick={handleClick} />
      </div>
    </div>
  );
};

export default EnterNameRoom;
