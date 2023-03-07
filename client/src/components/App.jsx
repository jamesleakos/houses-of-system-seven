// external
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// constants
import { CONNECTION_URL } from '../constants.js';

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

  return (
    <div className="App">
      {gameStarted ? <Game socket={socket} setGameStarted={setGameStarted} /> : <Pregame socket={socket} setGameStarted={setGameStarted} />}
    </div>
  );
}

export default App;
