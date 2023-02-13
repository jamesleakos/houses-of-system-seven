const gameMan = require('../managers/gameManager.js');

module.exports = (io, player) => {
  // actions
  const nextTurn = () => {
    console.log('requested next turn');
  };

  // ons
  player.on('request-next-turn', nextTurn);
};
