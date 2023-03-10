import React from 'react';

// internal
import './styles/AlertModal.css';

const AlertModal = ({ message, setModal }) => {
  return (
    <div className="alert-modal" onClick={() => setModal(false)}>
      <div className="interior">
        <div className="text">
          <div className="alert-modal-message">{message}</div>
        </div>
        <p className="exit-text">Click/touch anywhere to exit</p>
      </div>
    </div>
  );
};

export default AlertModal;
