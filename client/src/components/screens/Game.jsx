import React, { useEffect, useState } from 'react';

// imports
import PlayerTile from '../game/playerTile.jsx';
import ChooseAction from '../game/ChooseAction.jsx';
import BlockAction from '../game/BlockAction.jsx';
// css
import './styles/Game.css';

const Game = ({ socket, setGameStarted }) => {
  const [gameState, setGameState] = useState({
    players: [],
    currentPlayerIndex: 0,
    currentStatusOfPlay: ''
  });
  const [myPlayer, setMyPlayer] = useState({
    index: 0,
    name: '',
    delegates: [],
    money: 0,
    isAlive: true,
    canAct: false
  });
  const [uiState, setUIState] = useState('');
  const [currentAction, setCurrentAction] = useState({
    action: '',
    target: 0
  });

  useEffect(() => {
    if (!socket) return;

    socket.on('game-state', (newState) => {
      setGameState(newState);
    });

    socket.on('player-state', (newState) => {
      setMyPlayer(newState);
    });

    socket.on('room-closed', (room_id) => {
      setGameStarted(false);
    });

    socket.on('start-turn', (data) => {
      setGameState(data);
    });

    socket.emit('request-gamestate');
  }, [socket]);

  useEffect(() => {
    if (gameState.currentPlayerIndex === myPlayer.index) {
      setUIState('choose-action');
    } else {
      setUIState('waiting-on-action');
    }
  }, [gameState, myPlayer]);

  const takeAction = (action) => {
    if (['coup', 'assassinate', 'steal'].includes(action)) {
      setCurrentAction({
        action: action
      });
      setUIState('choose-target');
      return;
    }
    // else
    console.log('emitting');
    socket.emit('player-action', {
      action: action
    });
  };

  const gameAreaContent = () => {
    if (uiState === 'choose-action') {
      return <ChooseAction myPlayer={myPlayer} takeAction={takeAction} />;
    } else if (uiState === 'block-action') {
      return <BlockAction myPlayer={myPlayer} />;
    } else if (uiState === 'choose-target') {
      return <div>Choose a player to target</div>;
    } else {
      return <div>Placeholder</div>;
    }
  };

  return (
    <div className="game-screen" style={{ padding: '10px' }}>
      <div className="player-list" style={{ gridColumn: 1 }}>
        <h2 className="players-title">Players</h2>
        {gameState.players.map((player, index) => {
          return <PlayerTile key={player.index + ''} player={player} isCurrentPlayer={index === gameState.currentPlayerIndex} />;
        })}
      </div>

      <div className="play-area" style={{ gridColumn: 2 }}>
        <h3 className="status-of-play">{gameState.currentStatusOfPlay}</h3>
        {gameAreaContent()}
      </div>
    </div>
  );
};

export default Game;
