const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  time: String
});

const GameSchema = new mongoose.Schema({
  users: [String],
  time: String
});

const User = mongoose.model('users', UserSchema);
const Game = mongoose.model('games', GameSchema);

module.exports = {
  User,
  Game
};
