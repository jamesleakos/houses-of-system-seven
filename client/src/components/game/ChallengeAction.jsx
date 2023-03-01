import React from 'react';

// internal
import './styles/ChallengeAction.css';

const ChallengeAction = ({ myPlayer, challengeAction }) => {
  const parseAction = (ca) => {
    const addendum = '';
    if (ca.targetIndex > -1) {
      addendum = ` on player ${ca.targetIndex}`;
    }
    return `Player ${ca.playerIndex} is attempting to use ${ca.action}${addendum}`;
  };

  return (
    <div className="challenge-action">
      {
        // if myPlayer is the one being challenged, show a waiting screen
        myPlayer.index === challengeAction.playerIndex ? (
          <div>Waiting for challengers...</div>
        ) : (
          <div>
            <div>{parseAction(challengeAction)}</div>
            <div className="hoss-button">Challenge</div>
            <div className="hoss-button">Pass</div>
          </div>
        )
      }
    </div>
  );
};

export default ChallengeAction;
