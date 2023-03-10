import React from 'react';

// internal
import './styles/MobileLogModal.css';

const MobileLogModal = ({ log, setLogOn }) => {
  return (
    <div className="mobile-log-modal" onClick={() => setLogOn(false)}>
      <div className="interior">
        <div className="text">
          {log.map((logItem, index) => {
            return <p key={index + ''}>{logItem}</p>;
          })}
        </div>
        <p className="exit-text">Click/touch anywhere to exit</p>
      </div>
    </div>
  );
};

export default MobileLogModal;
