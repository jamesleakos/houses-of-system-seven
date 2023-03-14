import React, { useEffect, useState } from 'react';

// imports
import PlayerTile from '../game/PlayerTile.jsx';
import MyPlayerTile from '../game/MyPlayerTile.jsx';
import ChooseAction from '../game/ChooseAction.jsx';
import BlockAction from '../game/BlockAction.jsx';
import ChallengeAction from '../game/ChallengeAction.jsx';
import ChooseDelegate from '../game/ChooseDelegate.jsx';
import GameOver from '../game/GameOver.jsx';
import AlertModal from '../game/AlertModal.jsx';
import RulesModal from '../game/RulesModal.jsx';
import MobileLogModal from '../game/MobileLogModal.jsx';
// css
import './styles/Game.css';
import './styles/MobileGame.css';

const Game = ({ socket, setGameStarted, isMobile, playHover, playClick }) => {
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
  const [modalOn, setModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [rulesOn, setRulesOn] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-game', (data) => {
      setLog([]);
    });

    socket.on('start-turn', (data) => {
      setGameState(data);
      setLog((log) => [...log, '------------']);
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

      // modal
      setModal(true);
      setModalMessage('Game over. ' + data.winner + ' won!');
    });

    socket.on('challenge-result', (data) => {
      setLog((log) => [...log, data.text]);
      setUIState('waiting');
    });

    socket.on('role-changed', (data) => {
      setModal(true);
      setModalMessage(data.text);
    });

    socket.on('log', (data) => {
      setLog((log) => [...log, data]);
    });

    socket.on('player-disconnected', (data) => {
      setLog((log) => [...log, '------------']);
      setLog((log) => [...log, data]);
      setLog((log) => [...log, '------------']);
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
    socket.emit('player-action', {
      action: action
    });
  };

  const chooseTarget = (target) => {
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

    if (uiState === 'exchange-delegates' || uiState === 'discard-delegate') {
      setUIState('waiting');
    }
  };

  const exhangeDelegates = (delegates) => {
    socket.emit('delegate-exchange', {
      delegates: delegates
    });
  };

  const requestNewGame = () => {
    socket.emit('request-new-game');
  };

  const gameAreaContent = () => {
    if (uiState === 'end-game') {
      return <GameOver requestNewGame={requestNewGame} />;
    }
    if (!myPlayer.isAlive) {
      return <div>You are dead.</div>;
    }
    switch (uiState) {
      case 'choose-action':
        return <ChooseAction myPlayer={myPlayer} takeAction={takeAction} playHover={playHover} playClick={playClick} />;
      case 'block-action':
        return (
          <BlockAction
            myPlayer={myPlayer}
            blockAction={currentAttemptedAction}
            handleBlockResponse={blockResponse}
            playHover={playHover}
            playClick={playClick}
          />
        );
      case 'challenge-action':
        return (
          <ChallengeAction
            myPlayer={myPlayer}
            challengeAction={currentAttemptedAction}
            challengeResponse={challengeResponse}
            playHover={playHover}
            playClick={playClick}
          />
        );
      case 'block-challenge-action':
        return (
          <ChallengeAction
            myPlayer={myPlayer}
            challengeAction={currentAttemptedBlock}
            challengeResponse={challengeBlock}
            playHover={playHover}
            playClick={playClick}
          />
        );
      case 'discard-delegate':
        return (
          <ChooseDelegate
            delegates={myPlayer.delegates}
            chooseDelegates={discardDelegate}
            chooseNum={1}
            actionString={'discard'}
            playHover={playHover}
            playClick={playClick}
          />
        );
      case 'exchange-delegates':
        return (
          <ChooseDelegate
            delegates={[...myPlayer.delegates, ...delegatesForExchange]}
            chooseDelegates={exhangeDelegates}
            chooseNum={myPlayer.delegates.length}
            actionString={'keep'}
            playHover={playHover}
            playClick={playClick}
          />
        );
      case 'choose-target':
        return <div>Choose a player to target</div>;
      case 'waiting':
        return <div>Waiting...</div>;
      case 'waiting-on-voters':
        return <div>Waiting...</div>;
      default:
        return <div>Waiting...</div>;
    }
  };

  const playerTile = (player, index, displayIndex) => {
    if (myPlayer.index === index) {
      return (
        <MyPlayerTile
          key={index + ''}
          player={myPlayer}
          isCurrentPlayer={index === currentPlayerIndex}
          choosingTarget={uiState === 'choose-target'}
          isMobile={isMobile}
        />
      );
    } else {
      return (
        <PlayerTile
          key={index + ''}
          player={player}
          isCurrentPlayer={index === currentPlayerIndex}
          choosableTarget={uiState === 'choose-target' && player.isAlive}
          handleClick={chooseTarget}
          isMobile={isMobile}
          displayIndex={displayIndex}
          playHover={playHover}
          playClick={playClick}
        />
      );
    }
  };

  const Desktop = () => {
    return (
      <div className="game-screen desktop">
        <div className="wrapper">
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
              <div className="log-list">
                {log.map((logItem, index) => {
                  return <p key={index + ''}>{logItem}</p>;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* modal */}
        {modalOn ? <AlertModal message={modalMessage} setModal={setModal} /> : null}
        {/* rules */}
        {rulesOn ? (
          <RulesModal setRulesOn={setRulesOn} />
        ) : (
          <div
            className="hoss-button"
            style={{ color: 'black', position: 'fixed', bottom: '10px', left: '10px' }}
            onClick={() => {
              setRulesOn(true);
              playClick();
            }}
            onMouseEnter={() => playHover()}
          >
            VIEW GUIDE
          </div>
        )}
      </div>
    );
  };

  const Mobile = () => {
    const [logOn, setLogOn] = useState(false);
    const [mapOrder, setMapOrder] = useState(
      players.map((_, index) => (index + myPlayer?.index) % players.length).filter((_, index) => index !== 0)
    );
    useEffect(() => {
      if (!myPlayer.index) return;
      const temp = players.map((_, index) => (index + myPlayer.index) % players.length).filter((_, index) => index !== 0);
      setMapOrder(temp);
    }, [players, myPlayer]);

    return (
      <div className="game-screen mobile">
        <div className="wrapper">
          <div className="status-bar">
            <h3 className="status-of-play">{'STATUS: ' + currentStatusToText}</h3>
          </div>
          <div className="mobile-game-area">
            {playerTile(players[myPlayer.index], myPlayer.index, 0)}
            <div className="player-list">
              {mapOrder.map((playersIndex, displayIndex) => {
                return playerTile(players[playersIndex], playersIndex, displayIndex);
              })}
            </div>

            <div className="play-area">
              <h3 style={{ borderBottom: '1px solid white', marginBottom: '10px' }}>Play Area</h3>
              {gameAreaContent()}
            </div>
          </div>
        </div>

        {/* modal */}
        {modalOn ? <AlertModal message={modalMessage} setModal={setModal} /> : null}
        {/* rules */}
        {rulesOn ? (
          <RulesModal setRulesOn={setRulesOn} />
        ) : (
          <div
            className="hoss-button"
            style={{ color: 'black', position: 'fixed', bottom: '10px', left: '10px' }}
            onClick={() => {
              setRulesOn(true);
              playClick();
            }}
          >
            VIEW GUIDE
          </div>
        )}
        {/* log */}
        {logOn ? (
          <MobileLogModal log={log} setLogOn={setLogOn} />
        ) : (
          <div
            className="hoss-button"
            style={{ color: 'black', position: 'fixed', bottom: '10px', right: '10px' }}
            onClick={() => {
              setLogOn(true);
              playClick();
            }}
          >
            VIEW LOG
          </div>
        )}
      </div>
    );
  };

  return <div>{isMobile ? <Mobile /> : <Desktop />}</div>;
};

export default Game;
