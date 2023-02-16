// external
import React from 'react';

// internal
import './styles/ChooseAction.css';

const ChooseAction = ({ myPlayer, takeAction }) => {
  return (
    <div className="choose-action-screen">
      <div className="action-area">
        <h3>Universal Actions</h3>
        {/* Income */}
        <div
          className={'action ' + (myPlayer.money < 10 ? 'open-action' : 'closed-action')}
          onClick={() => {
            takeAction('income');
          }}
        >
          <div className="header">
            <h3>Take Income</h3>
            <p>+1 Gold</p>
          </div>
          <p className="block-info">Unblockable</p>
        </div>
        {/* Foriegn Aid */}
        <div
          className={'action ' + (myPlayer.money < 10 ? 'open-action' : 'closed-action')}
          onClick={() => {
            takeAction('foriegn_aid');
          }}
        >
          <div className="header">
            <h3>Foriegn Aid</h3>
            <p>+2 Gold</p>
          </div>
          <p className="block-info">Blockable By the Duke</p>
        </div>
        {/* Coup */}
        <div
          className={'action ' + (myPlayer.money >= 7 ? 'open-action' : 'closed-action')}
          onClick={() => {
            takeAction('coup');
          }}
        >
          <div className="header">
            <h3>Coup</h3>
            <p>-7 Gold</p>
          </div>
          <p className="action-info">Pick a player and destroy a delegate</p>
          <p className="block-info">Unblockable</p>
        </div>
        <h3>Character Actions</h3>
        {/* Tax */}
        <div
          className={'action ' + (myPlayer.money < 10 ? 'open-action' : 'closed-action')}
          onClick={() => {
            takeAction('tax');
          }}
        >
          <div className="header">
            <h3>Tax</h3>
            <p>+3 Gold</p>
          </div>
          <p className="player-info">
            {myPlayer.delegates.includes('duke')
              ? 'You have the duke, you would win a challenge.'
              : 'Pretend to have the duke. You would lose a challenge.'}
          </p>
          <p className="block-info">Unblockable</p>
        </div>
        {/* Assassinate */}
        <div
          className={'action ' + (myPlayer.money < 10 && myPlayer.money >= 3 ? 'open-action' : 'closed-action')}
          onClick={() => {
            takeAction('assassinate');
          }}
        >
          <div className="header">
            <h3>Assassinate</h3>
            <p>-3 Gold</p>
          </div>
          <p className="action-info">Pick a player and destroy a delegate</p>
          <p className="player-info">
            {myPlayer.delegates.includes('assassin')
              ? 'You have the assassin, you would win a challenge.'
              : 'Pretend to have the assassin. You would lose a challenge.'}
          </p>
          <p className="block-info">Blockable if target is the Contessa</p>
        </div>
        {/* Steal */}
        <div
          className={'action ' + (myPlayer.money < 10 && myPlayer.money >= 3 ? 'open-action' : 'closed-action')}
          onClick={() => {
            takeAction('steal');
          }}
        >
          <div className="header">
            <h3>Steal</h3>
            <p></p>
          </div>
          <p className="action-info">Steal 2 Gold from target player</p>
          <p className="player-info">
            {myPlayer.delegates.includes('captain')
              ? 'You have the captain, you would win a challenge.'
              : 'Pretend to have the captain. You would lose a challenge.'}
          </p>
          <p className="block-info">Blockable if target is the Contessa or Captain</p>
        </div>
        {/* Exchange Roles */}
        <div
          className={'action ' + (myPlayer.money < 10 ? 'open-action' : 'closed-action')}
          onClick={() => {
            takeAction('exchange');
          }}
        >
          <div className="header">
            <h3>Exchange Roles</h3>
            <p></p>
          </div>
          <p className="action-info">Draw 2 roles. Choose from new and current, discard the rest.</p>
          <p className="player-info">
            {myPlayer.delegates.includes('ambassador')
              ? 'You have the ambassador, you would win a challenge.'
              : 'Pretend to have the ambassador. You would lose a challenge.'}
          </p>
          <p className="block-info">Unblockable</p>
        </div>
      </div>
    </div>
  );
};

export default ChooseAction;
