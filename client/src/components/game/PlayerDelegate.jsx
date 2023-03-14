import React, { useState, useEffect } from 'react';

// internal
import constants from '../../game_helpers/constants.js';

const PlayerDelegate = ({ delegate, index, clickable, onClick, chosen, playHover, playClick }) => {
  const formatImageLink = (link) => {
    return `linear-gradient( rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) ), url('${link}')`;
  };

  const handleClick = () => {
    if (clickable) {
      playClick();
      onClick(index);
    }
  };

  return (
    <div
      className={'player-delegate' + (chosen ? ' chosen' : '') + (clickable ? ' clickable' : '')}
      style={{
        backgroundImage: formatImageLink(constants.Delegates[delegate]?.url)
      }}
      onClick={handleClick}
      onMouseEnter={() => {
        if (clickable) {
          playHover();
        }
      }}
    >
      <h3>{constants.Delegates[delegate]?.display}</h3>
    </div>
  );
};

export default PlayerDelegate;
