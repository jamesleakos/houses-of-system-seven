// require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);

const io = require('socket.io')(server, { cors: { origin: '*' } });

const rooms = [];

// events will go here...
io.on('connection', (socket) => {
  console.log('New User connected');

  socket.join('james room');

  socket.on('onTextChange', (data) => {
    // console.log(`Message from client: ${data.text}, whoose id is: ${data.from}`);
    io.to('other room').emit('on-text-change', data);
  });

  socket.on('request-new-room', () => {
    rooms.push({
      name: 'Room ' + rooms.length,
      players: [],
    });
    io.emit('rooms-update', rooms);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = 3000; // process.env.PORT || 80;
const URL = `http://localhost:${PORT}/`;

app.use(express.static(path.join(__dirname, '../client/dist')));

// needed to send the base files
// app.get('/*', function (req, res) {
//   res.sendFile(
//     path.join(__dirname, '../client/dist/index.html'),
//     function (err) {
//       if (err) {
//         res.status(500).send(err);
//       }
//     }
//   );
// });

server.listen(PORT, () => console.log(`Listening on ${URL}`));
