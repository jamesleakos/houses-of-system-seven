// external
import React, { useState, useEffect } from 'react';

// internal
import './styles/ChooseAction.css';

const ChooseAction = ({ myPlayer, takeAction, playHover, playClick }) => {
  const getActionStatus = () => {
    return {
      income: myPlayer.money < 10,
      foreign_aid: myPlayer.money < 10,
      coup: myPlayer.money >= 7,
      tax: myPlayer.money < 10,
      assassinate: myPlayer.money < 10 && myPlayer.money >= 3,
      steal: myPlayer.money < 10,
      exchange: myPlayer.money < 10
    };
  };

  const [actionsOpen, setActionsOpen] = useState(getActionStatus());

  useEffect(() => {
    setActionsOpen(getActionStatus());
  }, [myPlayer]);

  const handleClick = (action) => {
    if (!actionsOpen[action]) return;
    playClick();
    takeAction(action);
  };

  const formatImageLink = (link) => {
    return `linear-gradient( rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55) ), url('${link}')`;
  };

  return (
    <div className="choose-action-screen">
      <div className="action-area">
        <h3>Universal Actions</h3>
        {/* Income */}
        <div
          className={'action ' + (actionsOpen.income ? 'open-action' : 'closed-action')}
          onClick={() => {
            handleClick('income');
          }}
          onMouseEnter={() => {
            if (!actionsOpen.income) return;
            playHover();
          }}
          style={{
            backgroundImage: formatImageLink('https://ik.imagekit.io/hfywj4j0a/HOSS_Images/coins_pd7OITMyg.png')
          }}
        >
          <div className="header">
            <h3>Take Income</h3>
            <p className="action-cost">+1 Gold</p>
          </div>
          <p className="block-info">Unblockable</p>
        </div>
        {/* Foreign Aid */}
        <div
          className={'action ' + (actionsOpen.foreign_aid ? 'open-action' : 'closed-action')}
          onClick={() => {
            handleClick('foreign_aid');
          }}
          onMouseEnter={() => {
            if (!actionsOpen.foreign_aid) return;
            playHover();
          }}
          style={{
            backgroundImage: formatImageLink('https://ik.imagekit.io/hfywj4j0a/HOSS_Images/gold_bars_3c0GdRuRe.png')
          }}
        >
          <div className="header">
            <h3>Foreign Aid</h3>
            <p className="action-cost">+2 Gold</p>
          </div>
          <p className="block-info">Blockable By the Duke</p>
        </div>
        {/* Coup */}
        <div
          className={'action ' + (actionsOpen.coup ? 'open-action' : 'closed-action')}
          onClick={() => {
            handleClick('coup');
          }}
          onMouseEnter={() => {
            if (!actionsOpen.coup) return;
            playHover();
          }}
          style={{
            backgroundImage: formatImageLink('https://ik.imagekit.io/hfywj4j0a/HOSS_Images/coupball_XTHjEFn6Y.png')
          }}
        >
          <div className="header">
            <h3>Coup</h3>
            <p className="action-cost">-7 Gold</p>
          </div>
          <p className="action-info">Pick a player and destroy a delegate</p>
          <p className="block-info">Unblockable</p>
        </div>
        <h3>Character Actions</h3>
        {/* Tax */}
        <div
          className={'action ' + (actionsOpen.tax ? 'open-action' : 'closed-action')}
          onClick={() => {
            handleClick('tax');
          }}
          onMouseEnter={() => {
            if (!actionsOpen.tax) return;
            playHover();
          }}
          style={{
            backgroundImage: formatImageLink('https://ik.imagekit.io/hfywj4j0a/HOSS_Images/gold_space_bars_9GnkSjJ0m.png')
          }}
        >
          <div className="header">
            <h3>Tax</h3>
            <p className="action-cost">+3 Gold</p>
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
          className={'action ' + (actionsOpen.assassinate ? 'open-action' : 'closed-action')}
          onClick={() => {
            handleClick('assassinate');
          }}
          onMouseEnter={() => {
            if (!actionsOpen.assassinate) return;
            playHover();
          }}
          style={{
            backgroundImage: formatImageLink('https://ik.imagekit.io/hfywj4j0a/HOSS_Images/assassination_6Amkl7pf2.png')
          }}
        >
          <div className="header">
            <h3>Assassinate</h3>
            <p className="action-cost">-3 Gold</p>
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
          className={'action ' + (actionsOpen.steal ? 'open-action' : 'closed-action')}
          onClick={() => {
            handleClick('steal');
          }}
          onMouseEnter={() => {
            if (!actionsOpen.steal) return;
            playHover();
          }}
          style={{
            backgroundImage: formatImageLink('https://ik.imagekit.io/hfywj4j0a/HOSS_Images/tax_e1IkDMQIE.png')
          }}
        >
          <div className="header">
            <h3>Steal</h3>
            <p className="action-cost">+2 Gold</p>
          </div>
          <p className="action-info">Steal 2 Gold from target player - if they have it</p>
          <p className="player-info">
            {myPlayer.delegates.includes('captain')
              ? 'You have the captain, you would win a challenge.'
              : 'Pretend to have the captain. You would lose a challenge.'}
          </p>
          <p className="block-info">Blockable if target is the Ambassador or Captain</p>
        </div>
        {/* Exchange Roles */}
        <div
          className={'action ' + (actionsOpen.exchange ? 'open-action' : 'closed-action')}
          onClick={() => {
            handleClick('exchange');
          }}
          onMouseEnter={() => {
            if (!actionsOpen.exchange) return;
            playHover();
          }}
          style={{
            backgroundImage: formatImageLink('https://ik.imagekit.io/hfywj4j0a/HOSS_Images/spaceship_oLNUN7gI4.png')
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
