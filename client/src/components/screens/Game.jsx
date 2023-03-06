import React, { useEffect, useState } from 'react';

// imports
import PlayerTile from '../game/PlayerTile.jsx';
import MyPlayerTile from '../game/MyPlayerTile.jsx';
import ChooseAction from '../game/ChooseAction.jsx';
import BlockAction from '../game/BlockAction.jsx';
import ChallengeAction from '../game/ChallengeAction.jsx';
import ChooseDelegate from '../game/ChooseDelegate.jsx';
import GameOver from '../game/GameOver.jsx';
// css
import './styles/Game.css';

const Game = ({ socket, setGameStarted }) => {
  const [players, setPlayers] = useState([]);
  const [currentStatusToText, setCurrentStatusToText] = useState('');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [myPlayer, setMyPlayer] = useState({
    index: null,
    name: '',
    delegates: [],
    money: 0,
    isAlive: true,
    canAct: false
  });
  const [uiState, setUIState] = useState('');
  const [myCurrentAction, setMyCurrentAction] = useState({
    action: '',
    targetIndex: null
  });
  const [currentAttemptedAction, setCurrentAttemptedAction] = useState({
    action: '',
    targetIndex: null,
    playerIndex: null
  });
  const [currentAttemptedBlock, setCurrentAttemptedBlock] = useState({
    playerIndex: null,
    blockingAsDelegate: ''
  });
  const [delegatesForExchange, setDelegatesForExchange] = useState([]);
  const [log, setLog] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('start-turn', (data) => {
      setGameState(data);
    });
    // this is just called after the player loads in and requests the game state
    socket.on('game-state', (data) => {
      setGameState(data);
    });
    const setGameState = function (data) {
      setMyPlayer(data.player);
      setCurrentPlayerIndex(data.currentPlayerIndex);
      setPlayers(data.players);
      if (data.currentStatusOfPlay === 'choosing-action') {
        if (data.player.index === data.currentPlayerIndex) {
          setCurrentStatusToText('YOUR TURN!');
          setUIState('choose-action');
        } else {
          setCurrentStatusToText(data.currentStatusToText);
          setUIState('waiting-on-action');
        }
      }
    };

    socket.on('player-state', (newState) => {
      setMyPlayer(newState);
    });

    socket.on('room-closed', (room_id) => {
      setGameStarted(false);
    });

    socket.on('status-update', (data) => {
      setCurrentStatusToText(data.currentStatusToText);
    });

    socket.on('challenge-request', (data) => {
      setCurrentStatusToText(data.currentStatusToText);
      setCurrentAttemptedAction(data);
      setUIState('challenge-action');
    });

    socket.on('block-request', (data) => {
      setCurrentStatusToText(data.currentStatusToText);
      setCurrentAttemptedAction(data);
      setUIState('block-action');
    });

    socket.on('block-challenge-request', (data) => {
      setCurrentStatusToText(data.currentStatusToText);
      setCurrentAttemptedBlock({
        playerIndex: data.blockingPlayer,
        blockingAsDelegate: data.blockingAs
      });
      setUIState('block-challenge-action');
    });

    socket.on('discard-delegate', (data) => {
      setCurrentStatusToText('You must discard a delegate.');
      setUIState('discard-delegate');
    });

    socket.on('exchange-delegate-choices', (data) => {
      console.log('exchange data');
      console.log(data);
      setCurrentStatusToText('You must exchange a delegate.');
      setDelegatesForExchange(data);
      setUIState('exchange-delegates');
    });

    socket.on('player-voted', (playerIndex) => {
      setPlayers((players) => {
        players[playerIndex].voted = true;
        return players;
      });
    });

    socket.on('end-game', (data) => {
      setLog((log) => [...log, 'Game over. ' + data.winner + ' won!']);
      setCurrentStatusToText('Game over. ' + data.winner + ' won!');
      setPlayers(data.players);
      setUIState('end-game');
    });

    socket.on('challenge-result', (data) => {
      setLog((log) => [...log, data.text]);
      setUIState('waiting');
    });

    socket.on('log', (data) => {
      setLog((log) => [...log, data]);
    });

    socket.emit('request-gamestate');
  }, [socket]);

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

  const chooseTarget = (target) => {
    console.log('emitting target: ', target);
    socket.emit('player-action', {
      action: myCurrentAction.action,
      targetIndex: target
    });
    setMyCurrentAction({
      action: '',
      targetIndex: null
    });
  };

  const challengeResponse = (response) => {
    setCurrentStatusToText('Waiting on other players to respond.');
    socket.emit('player-challenge', {
      amChallenging: response
    });
    setUIState('waiting-on-voters');
  };

  const blockResponse = (response) => {
    setCurrentStatusToText('Waiting on other players to respond.');
    socket.emit('player-block', {
      amBlocking: response.blocking,
      blockingAs: response.delegate
    });
    setUIState('waiting-on-voters');
  };

  const challengeBlock = (response) => {
    setCurrentStatusToText('Waiting on other players to respond.');
    socket.emit('player-block-challenge', {
      amChallenging: response
    });
    setUIState('waiting-on-voters');
  };

  const discardDelegate = (delegates) => {
    // here we use an array so that we can reuse the choosedelegates obj for exchanges
    socket.emit('delegate-discard', {
      delegate: delegates[0]
    });
  };

  const exhangeDelegates = (delegates) => {
    socket.emit('delegate-exchange', {
      delegates: delegates
    });
  };

  const requestNewGame = () => {
    console.log('asking for new game');
    socket.emit('request-new-game');
  };

  const gameAreaContent = () => {
    if (!myPlayer.isAlive) {
      return <div>You are dead.</div>;
    }
    if (uiState === 'choose-action') {
      return <ChooseAction myPlayer={myPlayer} takeAction={takeAction} />;
    } else if (uiState === 'block-action') {
      return <BlockAction myPlayer={myPlayer} blockAction={currentAttemptedAction} handleBlockResponse={blockResponse} />;
    } else if (uiState === 'challenge-action') {
      return <ChallengeAction myPlayer={myPlayer} challengeAction={currentAttemptedAction} challengeResponse={challengeResponse} />;
    } else if (uiState === 'block-challenge-action') {
      return <ChallengeAction myPlayer={myPlayer} challengeAction={currentAttemptedBlock} challengeResponse={challengeBlock} />;
    } else if (uiState === 'discard-delegate') {
      return <ChooseDelegate delegates={myPlayer.delegates} chooseDelegates={discardDelegate} chooseNum={1} actionString={'discard'} />;
    } else if (uiState === 'exchange-delegates') {
      return (
        <ChooseDelegate
          delegates={[...myPlayer.delegates, ...delegatesForExchange]}
          chooseDelegates={exhangeDelegates}
          chooseNum={myPlayer.delegates.length}
          actionString={'keep'}
        />
      );
    } else if (uiState === 'choose-target') {
      return <div>Choose a player to target</div>;
    } else if (uiState === 'end-game') {
      return <GameOver requestNewGame={requestNewGame} />;
    } else if (uiState === 'waiting') {
      return <div>Waiting...</div>;
    } else if (uiState === 'waiting-on-voters') {
      return (
        <div>
          {players.map((player, index) => {
            if (player.voted) {
              return <div key={index + ''}>{player.name} acted</div>;
            } else {
              return (
                <div style={{ color: 'red' }} key={index + ''}>
                  {player.name} has not acted yet
                </div>
              );
            }
          })}
        </div>
      );
    } else {
      return <div>Waiting...</div>;
    }
  };

  const playerTile = (player, index) => {
    if (myPlayer.index === index) {
      return (
        <MyPlayerTile
          key={index + ''}
          player={myPlayer}
          isCurrentPlayer={index === currentPlayerIndex}
          choosingTarget={uiState === 'choose-target'}
        />
      );
    } else {
      return (
        <PlayerTile
          key={index + ''}
          player={player}
          isCurrentPlayer={index === currentPlayerIndex}
          choosingTarget={uiState === 'choose-target'}
          handleClick={chooseTarget}
        />
      );
    }
  };

  return (
    <div className="game-screen">
      <div className="status-bar">
        <h3 className="status-of-play">{'STATUS: ' + currentStatusToText}</h3>
      </div>
      <div className="game-area">
        <div className="player-list" style={{ gridColumn: 1 }}>
          <h3 className="players-title">Players</h3>
          {players.map((player, index) => {
            return playerTile(player, index);
          })}
        </div>

        <div className="play-area" style={{ gridColumn: 2 }}>
          {gameAreaContent()}
        </div>
        <div className="log-area" style={{ gridColumn: 3 }}>
          <h3>Log</h3>
          {log.map((logItem, index) => {
            return <p key={index + ''}>{logItem}</p>;
          })}
        </div>
      </div>
    </div>
  );
};

export default Game;
