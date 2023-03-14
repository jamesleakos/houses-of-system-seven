/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import RoomTile from './RoomTile.jsx';

import './styles/Lobby.css';

const Lobby = ({ rooms, createRoom, joinRoom, isMobile, playHover, playClick }) => {
  return (
    <div className={'lobby' + (isMobile ? ' mobile' : '')}>
      <div className="lobby-bar">
        <h1 className="lobby-title">Open Rooms</h1>
        <div
          className="new-room-button hoss-button"
          onMouseEnter={playHover}
          onClick={() => {
            createRoom();
            playClick();
          }}
        >
          NEW ROOM
        </div>
      </div>

      <div className="rooms-area">
        {rooms.length < 1 ? (
          <p style={{ color: 'white', textAlign: 'left', margin: '20px' }}>No open rooms.</p>
        ) : (
          rooms.map((room) => {
            return <RoomTile key={room.id} room={room} joinRoom={joinRoom} playHover={playHover} playClick={playClick} />;
          })
        )}
      </div>
    </div>
  );
};

export default Lobby;
