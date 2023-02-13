import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

import EnterNameRoom from '../pregame/EnterNameRoom/EnterNameRoom.jsx';

const connection_url = 'http://localhost:3000'; // process.env.REACT_APP_SOCKET_API;

// // imports
import Lobby from '../pregame/Lobby/Lobby.jsx';
import WaitingRoom from '../pregame/WaitingRoom/WaitingRoom.jsx';

const Pregame = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [myRoomID, setMyRoomID] = useState(null);
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const s = io(connection_url, { transport: ['websocket'] });

    s.on('rooms-update', (data) => {
      console.log('got rooms-update');
      setRooms(data.filter((r) => !r.started));
    });

    s.on('you-joined-room', (room_id) => {
      console.log('got you-joined-room');
      setMyRoomID(room_id);
    });

    s.on('you-left-room', (room_id) => {
      console.log('got you-left-room');
      setMyRoomID(null);
    });

    s.on('game-started', (room_id) => {
      console.log('game started');
      navigate(`/game/${room_id}`);
    });

    setSocket(s);
  }, []);

  const createRoom = () => {
    socket.emit('request-new-room', {
      roomname: 'New Room',
      username: username,
    });
  };

  const joinRoom = (room_id) => {
    socket.emit('request-join-room', {
      room_id,
      username,
    });
  };

  const leaveRoom = () => {
    socket.emit('request-leave-room');
  };

  const startGame = () => {
    socket.emit('request-start-game', {
      room_id: myRoomID,
    });
  };

  return (
    <div>
      {username === '' ? (
        <EnterNameRoom setUsername={setUsername} />
      ) : !!rooms.find((r) => r.id === myRoomID) ? (
        <WaitingRoom
          room={rooms.find((r) => r.id === myRoomID)}
          leaveRoom={leaveRoom}
          startGame={startGame}
        />
      ) : (
        <Lobby rooms={rooms} createRoom={createRoom} joinRoom={joinRoom} />
      )}
    </div>
  );
};

export default Pregame;
