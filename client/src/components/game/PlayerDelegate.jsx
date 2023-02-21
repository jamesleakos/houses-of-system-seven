import React, { useState, useEffect } from 'react';

// internal
import './styles/PlayerDelegate.css';
import constants from '../../game_helpers/constants.js';

const PlayerDelegate = ({ delegate }) => {
  const formatImageLink = (link) => {
    return `linear-gradient( rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55) ), url('${link}')`;
  };

  return (
    <div
      className="player-delegate"
      style={{
        backgroundImage: formatImageLink(constants.Delgates[delegate].url)
      }}
    >
      <h3>{constants.Delgates[delegate].display}</h3>
    </div>
  );
};

export default PlayerDelegate;
