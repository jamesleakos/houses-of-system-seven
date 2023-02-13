import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const connection_url = 'http://localhost:3000'; // process.env.REACT_APP_SOCKET_API;

// imports

const Pregame = () => {
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const s = io(connection_url, { transport: ['websocket'] });

    s.on('game-state', (state) => {
      console.log('got state-update');
      setGameState(state);
    });

    s.on('room-closed', (room_id) => {
      navigate(`/`);
    });

    setSocket(s);
  }, []);

  const nextTurn = () => {
    socket.emit('request-next-turn');
  };

  return (
    <div>
      <input type='button' value='Next Turn' onClick={nextTurn} />
    </div>
  );
};

export default Pregame;
