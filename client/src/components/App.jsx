// external
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

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
        <Game socket={socket} setGameStarted={setGameStarted} isMobile={isMobile} />
      ) : (
        <Pregame socket={socket} setGameStarted={setGameStarted} isMobile={isMobile} />
      )}
    </div>
  );
}

export default App;
