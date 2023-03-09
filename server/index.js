require('dotenv').config();
// THIS IS NEEDED to call the db file even if we don't use the output
const db = require('./db');

const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

const playerHandler = require('./ioHandlers/playerHandler.js');

// register the io handlers
const onConnection = (socket) => {
  playerHandler(io, socket);
};
io.on('connection', onConnection);

// send the FE files
app.use(express.static(path.join(__dirname, '../client/dist')));

// start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
