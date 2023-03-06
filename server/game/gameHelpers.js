const constants = require('./constants.js');

const buildGamePlayers = (roomPlayers) => {
  return roomPlayers.map((roomPlayer, index) => {
    return {
      index: index,
      socket_id: roomPlayer.id,
      name: roomPlayer.name,
      delegates: [],
      money: 0,
      isAlive: true,
      voted: false,
      active: true
    };
  });
};

const buildGamePlayersToSendSafe = (gamePlayers) => {
  return gamePlayers.map((gamePlayer) => {
    return {
      index: gamePlayer.index,
      name: gamePlayer.name,
      delegates_count: gamePlayer.delegates.length,
      money: gamePlayer.money,
      isAlive: gamePlayer.isAlive,
      active: gamePlayer.active,
      voted: gamePlayer.voted
    };
  });
};

const buildIDToPlayer = (gamePlayers) => {
  const out = {};
  for (let player of gamePlayers) {
    out[player.socket_id] = player;
  }
  return out;
};

const buildDeck = () => {
  let deck = [];
  let cardNames = constants.CardNames.values();
  for (let card of cardNames) {
    for (let i = 0; i < 3; i++) {
      deck.push(card);
    }
  }
  deck = shuffle(deck);
  return deck;
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

module.exports = {
  buildGamePlayers: buildGamePlayers,
  buildIDToPlayer: buildIDToPlayer,
  buildDeck: buildDeck,
  shuffle: shuffle,
  buildGamePlayersToSendSafe: buildGamePlayersToSendSafe
};
