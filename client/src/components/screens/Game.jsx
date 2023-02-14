import React, { useEffect, useState } from 'react';

// imports
import PlayerTile from '../game/playerTile.jsx';

const Game = ({ socket, setGameStarted }) => {
  const [gameState, setGameState] = useState({
    players: []
  });

  useEffect(() => {
    if (!socket) return;

    socket.on('game-state', (data) => {
      console.log('game-state');
      console.log(data);
      const n = { ...gameState, players: data.players };
      setGameState(n);
    });

    socket.on('room-closed', (room_id) => {
      setGameStarted(false);
    });

    socket.on('start-turn', (data) => {
      console.log('start turn');
      console.log(data);
      const n = { ...gameState, players: data.players };
      setGameState(n);
    });

    socket.emit('request-gamestate');
  }, [socket]);

  const nextTurn = () => {
    socket.emit('do-action', {
      action: 'take-income'
    });
  };

  return (
    <div className="game-screen" style={{ padding: '10px' }}>
      <div className="player-list">
        {gameState.players.map((player) => {
          return <PlayerTile player={player} />;
        })}
      </div>

      <input type="button" value="Next Turn" onClick={nextTurn} />
    </div>
  );
};

export default Game;
