import React from 'react';

// internal
import './styles/BlockAction.css';
import Constants from '../../game_helpers/constants.js';

const BlockAction = ({ myPlayer, blockAction, handleBlockResponse }) => {
  const parseAction = (ca) => {
    let addendum = '';
    if (ca.targetIndex > -1) {
      addendum = ` on player ${ca.targetIndex}`;
    }
    return `Player ${ca.playerIndex} is attempting to use ${ca.action}${addendum}`;
  };

  const parseDelegateNotice = (delegate) => {
    if (myPlayer.delegates.incluces(delegate)) {
      return `You are the ${Constants.Delegates[delegate].display}. You would win a challenge.`;
    } else {
      return `You are not the ${Constants.Delegates[delegate].display}. You would lose a challenge.`;
    }
  };

  const [actionObj, setActionObj] = React.useState(Constants.Actions[blockAction]);

  return (
    <div className="block-action">
      {myPlayer.index === blockAction.playerIndex ? (
        <div>Waiting for blockers...</div>
      ) : (
        <div>
          <div>{parseAction(blockAction)}</div>
          <div className="block-button-area">
            {actionObj.blockableBy.map((delegate) => {
              return (
                <div
                  className="block-button block hoss-button"
                  style={{ backgroundImage: `url(${Constants.Delegates[delegate].url})` }}
                  onClick={() => handleBlockResponse({ blocking: true, delegate: delegate })}
                >
                  <h3>{`Block with ${Constants.Delegates[delegate].display}`}</h3>
                  <p>{parseDelegateNotice(delegate)}</p>
                </div>
              );
            })}
            <div
              className="challenge-button pass hoss-button"
              style={{ backgroundImage: "url('https://ik.imagekit.io/hfywj4j0a/HOSS_Images/tax_e1IkDMQIE.png')" }}
              onClick={() => handleBlockResponse({ blocking: false })}
            >
              <h3>Pass</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockAction;
