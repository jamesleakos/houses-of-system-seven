const CardNames = {
  DUKE: 'duke',
  ASSASSIN: 'assassin',
  CAPTAIN: 'captain',
  AMBASSADOR: 'ambassador',
  CONTESSA: 'contessa',
  values: function () {
    return [this.DUKE, this.ASSASSIN, this.CAPTAIN, this.AMBASSADOR, this.CONTESSA];
  }
};

const Actions = {
  income: {
    delegate: 'all',
    blockableBy: [],
    isChallengeable: false,
    execute: function (game, player, target) {
      player.money += 1;
      game.nextTurn();
    }
  },
  foreign_aid: {
    delegate: 'all',
    blockableBy: [CardNames.DUKE],
    isChallengeable: false,
    execute: function (game, player, target) {
      player.money += 2;
      game.nextTurn();
    }
  },
  coup: {
    delegate: 'all',
    blockableBy: [],
    isChallengeable: false,
    execute: function (game, player, target) {
      if (!target) {
        console.log('No target supplied');
        return;
      }
      if (player.money < 7) {
        console.log('Not enough money');
        return;
      }
      player.money -= 7;
      game.removeDelegate(target);
    }
  },
  tax: {
    delegate: CardNames.DUKE,
    blockableBy: [],
    isChallengeable: true,
    execute: function (game, player, target) {
      player.money += 3;
      game.nextTurn();
    }
  },
  assassinate: {
    delegate: CardNames.ASSASSIN,
    blockableBy: [CardNames.CONTESSA],
    isChallengeable: true,
    execute: function (game, player, target) {
      if (!target) {
        console.log('No target supplied');
        return;
      }
      if (player.money < 3) {
        console.log('Not enough money');
        return;
      }
      player.money -= 3;
      game.removeDelegate(target);
    }
  },
  exchange: {
    delegate: CardNames.AMBASSADOR,
    blockableBy: [],
    isChallengeable: true,
    execute: function (game, player, target) {
      game.sentDelegates = [game.deck.pop(), game.deck.pop()];
      game.currentStatusOfPlay = StatusOfPlay.EXCHANGING_DELEGATES;
      game.sendToPlayer('exchange-delegate-choices', game.sentDelegates, player.socket_id);
    }
  },
  steal: {
    delegate: CardNames.CAPTAIN,
    blockableBy: [CardNames.CAPTAIN, CardNames.AMBASSADOR],
    isChallengeable: true,
    execute: function (game, player, target) {
      if (!target) {
        console.log('No target supplied');
        return;
      }
      const stolen = Math.min(target.money, 2);
      target.money -= stolen;
      player.money += stolen;
      game.nextTurn();
    }
  }
};

const CounterActions = {
  block_foreign_aid: {
    delegates: [CardNames.DUKE]
  },
  block_steal: {
    delegates: [CardNames.AMBASSADOR, CardNames.CAPTAIN]
  },
  block_assassinate: {
    delegates: [CardNames.CONTESSA]
  }
};

const StatusOfPlay = {
  CHOOSING_ACTION: 'choosing-action',
  REQUESTING_CHALLENGES: 'requesting-challenges',
  REQUESTING_BLOCK_CHALLENGES: 'requesting-block-challenges',
  REQUESTING_BLOCKS: 'requesting-blocks',
  DISCARDING_DELEGATE: 'discarding-delegate',
  EXCHANGING_DELEGATES: 'exhanging-delegates'
};

module.exports = {
  CardNames: CardNames,
  Actions: Actions,
  CounterActions: CounterActions,
  StatusOfPlay: StatusOfPlay
};
