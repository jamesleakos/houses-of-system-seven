/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const connection_url = 'http://localhost:3000'; // process.env.REACT_APP_SOCKET_API;

// // imports
import Lobby from '../pregame/Lobby.jsx';
const WaitingRoom = import('../pregame/WaitingRoom.jsx');

const Pregame = () => {
  const [rooms, setRooms] = useState([]);
  const [myRoom, setMyRoom] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(connection_url, { transport: ['websocket'] });

    s.on('rooms-update', (data) => {
      console.log(data);
      setRooms(data);
    });

    setSocket(s);
  }, []);

  const createRoom = () => {
    socket.emit('request-new-room');
  };

  return (
    <div>
      {!!myRoom ? (
        <WaitingRoom room={myRoom} />
      ) : (
        <Lobby rooms={rooms} createRoom={createRoom} />
      )}
    </div>
  );
};

export default Pregame;
