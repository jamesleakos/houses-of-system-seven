import React from 'react';

// internal
import './styles/ChallengeAction.css';

const ChallengeAction = ({ myPlayer, challengeAction, challengeResponse, playHover, playClick }) => {
  return (
    <div className="challenge-action">
      {
        // if myPlayer is the one being challenged, show a waiting screen
        myPlayer.index === challengeAction.playerIndex ? (
          <div>Waiting for challengers...</div>
        ) : (
          <div>
            <div>Challenge or Pass...</div>
            <div className="challenge-button-area">
              <div
                className="challenge-button challenge hoss-button"
                onMouseEnter={playHover}
                onClick={() => {
                  playClick();
                  challengeResponse(true);
                }}
              >
                <h3>Challenge</h3>
              </div>
              <div
                className="challenge-button pass hoss-button"
                onMouseEnter={playHover}
                onClick={() => {
                  playClick();
                  challengeResponse(false);
                }}
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
