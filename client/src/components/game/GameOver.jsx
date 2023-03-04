import React from 'react';

// internal
import './styles/GameOver.css';

const GameOver = ({ requestNewGame }) => {
  return (
    <div className="game-over">
      <h3>Game Over</h3>
      <div
        className="hoss-button"
        style={{ backgroundImage: "url('https://ik.imagekit.io/hfywj4j0a/HOSS_Images/tax_e1IkDMQIE.png')" }}
        onClick={() => requestNewGame()}
      >
        <h3>New Game</h3>
      </div>
    </div>
  );
};

export default GameOver;
