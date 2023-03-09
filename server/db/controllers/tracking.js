const mongoose = require('mongoose');
const { User, Game } = require('../models/Tracking.js');

exports.addUser = (username) => {
  User.create({ name: username, time: currTime() });
};

exports.addGame = (users) => {
  Game.create({ users: users, time: currTime() });
};

const currTime = () => {
  var currentdate = new Date();
  var datetime =
    currentdate.getFullYear() +
    '-' +
    (currentdate.getMonth() + 1) +
    '-' +
    currentdate.getDate() +
    ' @ ' +
    currentdate.getHours() +
    ':' +
    currentdate.getMinutes() +
    ':' +
    currentdate.getSeconds();
  return datetime;
};
