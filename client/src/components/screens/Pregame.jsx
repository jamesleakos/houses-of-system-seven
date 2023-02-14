import React, { useEffect, useRef, useState } from 'react';

import EnterNameRoom from '../pregame/EnterNameRoom/EnterNameRoom.jsx';

// // imports
import Lobby from '../pregame/Lobby/Lobby.jsx';
import WaitingRoom from '../pregame/WaitingRoom/WaitingRoom.jsx';

const Pregame = ({ socket, setGameStarted }) => {
  const [rooms, setRooms] = useState([]);
  const [username, setUsername] = useState('');
  const [myRoomID, setMyRoomID] = useState(null);

  useEffect(() => {
    // pregame
    if (!socket) return;
    console.log(socket);
    socket.on('rooms-update', (data) => {
      console.log('got rooms-update');
      setRooms(data.filter((r) => !r.started));
    });

    socket.on('you-joined-room', (room_id) => {
      console.log('got you-joined-room');
      setMyRoomID(room_id);
    });

    socket.on('you-left-room', (room_id) => {
      console.log('got you-left-room');
      setMyRoomID(null);
    });

    socket.on('game-started', (room_id) => {
      setGameStarted(true);
    });

    socket.on('next-turn', () => {
      console.log('next turn recieved in pregame - shouldnt happen');
    });
  }, [socket]);

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
