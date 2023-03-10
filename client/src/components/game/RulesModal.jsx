import React from 'react';

// internal
import './styles/RulesModal.css';

const RulesModal = ({ setRulesOn }) => {
  return (
    <div className="rules-modal" onClick={() => setRulesOn(false)}>
      <div className="interior">
        <div className="text">
          <h1>ACTIONS</h1>
          <br />
          <p>UNIVERSAL ACTIONS can be used by players holding any role without fear of a CHALLENGE.</p>
          <br />
          <p>
            CHARACTER ACTIONS are associated with a delegate. They can be used by any player, but if another player challenges, they must
            prove they are holding that delegate, or they will lose a delegate. However, if they were indeed holding that delegate, the
            challenging player will lose a delegate.
          </p>
          <br />
          <p>
            In addition to being challenged, some actions can also be BLOCKED by certain other delegates. In a block, a player accepts that
            an action was performed by a player holding the appropriate delegate, but they claim they are holding a delegate that can
            counter it. This block, a counter action, can also be challenged.
          </p>
          <br />
          <h2>Universal Actions</h2>
          <br />
          <div className="action">
            <h3>Income</h3>
            <p>Gain one gold. Cannot be blocked.</p>
          </div>
          <br />
          <div className="action">
            <h3>Foriegn Aid</h3>
            <p>Gain two gold. This can be blocked by the Duke.</p>
          </div>
          <br />
          <div className="action">
            <h3>Coup</h3>
            <p>Remove one delegate from target player.</p>
          </div>
          <br />
          <h2>Character Actions</h2>
          <p>All of these actions are subject to challenges.</p>
          <br />
          <div className="action">
            <h3>Tax - Duke's Action</h3>
            <p>Gain three gold. Cannot be blocked.</p>
          </div>
          <br />
          <div className="action">
            <h3>Assassinate - Assassin's Action</h3>
            <p>Remove one delegate from target player. Can by blocked by the Contessa.</p>
          </div>
          <br />
          <div className="action">
            <h3>Steal - Captain's Action</h3>
            <p>Steal 2 Gold from target player - if they have it. Can be blocked by another Captain or the Ambassador.</p>
          </div>
          <br />
          <div className="action">
            <h3>Exchange Roles - Ambassador's Action</h3>
            <p>Draw 2 roles. Choose from new and current, discard the rest. Cannot be blocked.</p>
          </div>
        </div>
        <p className="exit-text">Click/touch anywhere to exit</p>
      </div>
    </div>
  );
};

export default RulesModal;
