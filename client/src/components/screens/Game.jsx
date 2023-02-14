import React, { useEffect, useState } from 'react';

// imports

const Game = ({ socket, setGameStarted }) => {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('game-state', (state) => {
      console.log('got state-update');
      setGameState(state);
    });

    socket.on('room-closed', (room_id) => {
      setGameStarted(false);
    });

    socket.on('next-turn', () => {
      console.log('next turn recieved in game');
    });
  }, [socket]);

  const nextTurn = () => {
    socket.emit('request-next-turn');
  };

  return (
    <div>
      <input type='button' value='Next Turn' onClick={nextTurn} />
    </div>
  );
};

export default Game;
