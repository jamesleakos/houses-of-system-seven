import React, { useState, useEffect } from 'react';

// internal
import './styles/BlockAction.css';
import Constants from '../../game_helpers/constants.js';

const BlockAction = ({ myPlayer, blockAction, handleBlockResponse, playHover, playClick }) => {
  const parseAction = (ba) => {
    let addendum = '';
    if (ba.targetIndex > -1) {
      addendum = ` on player ${ba.targetIndex}`;
    }
    return `Player ${ba.playerIndex} is attempting to use ${ba.action}${addendum}`;
  };

  const parseDelegateNotice = (delegate) => {
    if (myPlayer.delegates.includes(delegate)) {
      return `You are the ${Constants.Delegates[delegate].display}. You would win a challenge.`;
    } else {
      return `You are not the ${Constants.Delegates[delegate].display}. You would lose a challenge.`;
    }
  };

  const [actionObj, setActionObj] = useState(Constants.Actions[blockAction.action]);

  const [twoCols, setTwoCols] = useState(window.innerWidth > 1000);
  function handleWindowSizeChange() {
    setTwoCols(window.innerWidth > 1000);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  return (
    <div className="block-action">
      {myPlayer.index === blockAction.playerIndex || (actionObj.onlyTargetBlocks && myPlayer.index !== blockAction.targetIndex) ? (
        <div>Waiting for blockers...</div>
      ) : (
        <div>
          {/* <div>{parseAction(blockAction)}</div> */}
          <div className="block-button-area">
            {actionObj?.blockableBy.map((delegate, index) => {
              return (
                <div
                  className="block-button"
                  style={{ backgroundImage: `url('${Constants.Delegates[delegate].url}')`, gridColumn: twoCols ? (index % 2) + 1 : 1 }}
                  onClick={() => {
                    playClick();
                    handleBlockResponse({ blocking: true, delegate: delegate });
                  }}
                  onMouseEnter={playHover}
                  key={delegate}
                >
                  <h3>{`Block with ${Constants.Delegates[delegate].display}`}</h3>
                  <p className="notice">{parseDelegateNotice(delegate)}</p>
                </div>
              );
            })}
            <div
              className="block-button"
              style={{ backgroundImage: "url('https://ik.imagekit.io/hfywj4j0a/HOSS_Images/tax_e1IkDMQIE.png')" }}
              onMouseEnter={playHover}
              onClick={() => {
                playClick();
                handleBlockResponse({ blocking: false });
              }}
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
