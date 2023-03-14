// external
import React, { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import hoverSfx from '../sounds/light_click.mp3';
import clickSfx from '../sounds/heavy_click.mp3';

// constants
import { CONNECTION_URL } from '../network_constants.js';

// css
import '../styles.css';
// components
import Pregame from './screens/Pregame.jsx';
import Game from './screens/Game.jsx';

// App
function App() {
  const [socket, setSocket] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const hoverSound = useMemo(() => new Audio(hoverSfx));
  const clickSound = useMemo(() => new Audio(clickSfx));

  const playHover = function () {
    hoverSound.play();
  };

  const playClick = function () {
    clickSound.play();
  };

  useEffect(() => {
    const s = io(CONNECTION_URL, { transport: ['websocket'] });
    setSocket(s);
  }, []);

  // for mobile vs desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  function handleWindowSizeChange() {
    setIsMobile(window.innerWidth < 768);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  return (
    <div className="App">
      {gameStarted ? (
        <Game socket={socket} setGameStarted={setGameStarted} isMobile={isMobile} playHover={playHover} playClick={playClick} />
      ) : (
        <Pregame socket={socket} setGameStarted={setGameStarted} isMobile={isMobile} playHover={playHover} playClick={playClick} />
      )}
    </div>
  );
}

export default App;
