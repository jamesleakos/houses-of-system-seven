import React from 'react';

// internal
import './styles/ChallengeAction.css';

const ChallengeAction = ({ myPlayer, challengeAction, challengeResponse }) => {
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
            <div className="challenge-button-area">
              <div
                className="challenge-button challenge hoss-button"
                style={{ gridColumn: 1, backgroundImage: "url('https://ik.imagekit.io/hfywj4j0a/HOSS_Images/coupball_XTHjEFn6Y.png')" }}
                onClick={() => challengeResponse(true)}
              >
                <h3>Challenge</h3>
              </div>
              <div
                className="challenge-button pass hoss-button"
                style={{ gridColumn: 3, backgroundImage: "url('https://ik.imagekit.io/hfywj4j0a/HOSS_Images/tax_e1IkDMQIE.png')" }}
                onClick={() => challengeResponse(false)}
              >
                <h3>Pass</h3>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default ChallengeAction;
