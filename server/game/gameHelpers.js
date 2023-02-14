const buildGamePlayers = (roomPlayers) => {
  return roomPlayers.map((roomPlayer, index) => {
    return {
      index: index,
      socket_id: roomPlayer.id,
      name: roomPlayer.name,
      delegates: [],
      money: 0,
      isAlive: true,
      canAct: false
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
      canAct: gamePlayer.canAct
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

module.exports = {
  buildGamePlayers: buildGamePlayers,
  buildIDToPlayer: buildIDToPlayer,
  buildGamePlayersToSendSafe: buildGamePlayersToSendSafe
};
