import React, { useEffect, useState } from 'react';

// imports
import PlayerTile from '../game/playerTile.jsx';
import MyPlayerTile from '../game/MyPlayerTile.jsx';
import ChooseAction from '../game/ChooseAction.jsx';
import BlockAction from '../game/BlockAction.jsx';
import ChallengeAction from '../game/ChallengeAction.jsx';
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
  const [myCurrentAction, setMyCurrentAction] = useState({
    action: '',
    target: 0
  });
  const [challengeAction, setChallengeAction] = useState({
    action: '',
    targetIndex: 0,
    playerIndex: 0
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

    socket.on('challenge-request', (data) => {
      setChallengeAction(data);
      setUIState('challenge-action');
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
      setMyCurrentAction({
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

  const challengeResponse = (response) => {
    console.log('should be emitting');
    socket.emit('player-challenge', {
      amChallenging: response
    });
  };

  const gameAreaContent = () => {
    if (uiState === 'choose-action') {
      return <ChooseAction myPlayer={myPlayer} takeAction={takeAction} />;
    } else if (uiState === 'block-action') {
      return <BlockAction myPlayer={myPlayer} />;
    } else if (uiState === 'challenge-action') {
      return <ChallengeAction myPlayer={myPlayer} challengeAction={challengeAction} challengeResponse={challengeResponse} />;
    } else if (uiState === 'choose-target') {
      return <div>Choose a player to target</div>;
    } else {
      return <div>Placeholder</div>;
    }
  };

  const playerTile = (player, index) => {
    if (myPlayer.index === index) {
      return <MyPlayerTile key={index + ''} player={myPlayer} isCurrentPlayer={index === gameState.currentPlayerIndex} />;
    } else {
      return <PlayerTile key={index + ''} player={player} isCurrentPlayer={index === gameState.currentPlayerIndex} />;
    }
  };

  return (
    <div className="game-screen">
      <div className="status-bar">
        <h3 className="status-of-play">{'STATUS: ' + gameState.currentStatusOfPlay}</h3>
      </div>
      <div className="game-area">
        <div className="player-list" style={{ gridColumn: 1 }}>
          <h3 className="players-title">Players</h3>
          {gameState.players.map((player, index) => {
            return playerTile(player, index);
          })}
        </div>

        <div className="play-area" style={{ gridColumn: 2 }}>
          {gameAreaContent()}
        </div>
        <div className="log-area" style={{ gridColumn: 3 }}>
          <h3>Log</h3>
          <p>Some text</p>
        </div>
      </div>
    </div>
  );
};

export default Game;
