import React from 'react';

// internal
import './styles/AlertModal.css';

const AlertModal = ({ message, setModal }) => {
  return (
    <div className="alert-modal" onClick={() => setModal(false)}>
      <div className="interior">
        <div className="alert-modal-message">{message}</div>
      </div>
    </div>
  );
};

export default AlertModal;
