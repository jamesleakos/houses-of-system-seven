import React, { useEffect } from 'react';

// internal
import PlayerDelegate from './PlayerDelegate.jsx';
import './styles/ChooseDelegate.css';

const ChooseDelegate = ({ delegates, chooseDelegates, chooseNum, actionString, playHover, playClick }) => {
  const [chosenIndices, setChosenIndices] = React.useState([]);

  useEffect(() => {
    if (chosenIndices.length === chooseNum) {
      chooseDelegates(delegates.filter((_, index) => chosenIndices.includes(index)));
    }
  }, [chosenIndices]);

  const toggleChosen = (index) => {
    if (chosenIndices.includes(index)) {
      setChosenIndices(chosenIndices.filter((i) => i !== index));
    } else {
      setChosenIndices([...chosenIndices, index]);
    }
  };

  return (
    <div className="choose-delegates">
      <h3>{`Choose ${chooseNum} to ${actionString}`}</h3>
      <div className="player-delegates">
        {delegates.map((delegate, index) => {
          return (
            <PlayerDelegate
              key={index}
              index={index}
              delegate={delegate}
              onClick={toggleChosen}
              clickable={true}
              chosen={chosenIndices.includes(index)}
              style={{ gridColumn: (index % 2) + 1 }}
              playHover={playHover}
              playClick={playClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ChooseDelegate;
