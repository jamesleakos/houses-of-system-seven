import React, { useEffect } from 'react';

// internal
import PlayerDelegate from './PlayerDelegate.jsx';
import './styles/ChooseDelegate.css';

const ChooseDelegate = ({ delegates, chooseDelegates, chooseNum, actionString }) => {
  const [chosenIndices, setChosenIndices] = React.useState([]);

  useEffect(() => {
    console.log('chosenIndices: ', JSON.stringify(chosenIndices));
    console.log('chooseNum: ', chooseNum);
    if (chosenIndices.length === chooseNum) {
      console.log('should be triggering');
      console.log(delegates.filter((_, index) => chosenIndices.includes(index)));
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
            />
          );
        })}
      </div>
    </div>
  );
};

export default ChooseDelegate;
