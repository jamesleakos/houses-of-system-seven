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
    moneyDelta: 1
  },
  foreign_aid: {
    delegate: 'all',
    blockableBy: [CardNames.DUKE],
    isChallengeable: false,
    moneyDelta: 2
  },
  coup: {
    delegate: 'all',
    blockableBy: [],
    isChallengeable: false,
    moneyDelta: -7
  },
  tax: {
    delegate: CardNames.DUKE,
    blockableBy: [],
    isChallengeable: true,
    moneyDelta: 3
  },
  assassinate: {
    delegate: CardNames.ASSASSIN,
    blockableBy: [CardNames.CONTESSA],
    isChallengeable: true,
    moneyDelta: -3
  },
  exchange: {
    delegate: CardNames.AMBASSADOR,
    blockableBy: [],
    isChallengeable: true,
    moneyDelta: 0
  },
  steal: {
    delegate: CardNames.CAPTAIN,
    blockableBy: [CardNames.AMBASSADOR, CardNames.AMBASSADOR],
    isChallengeable: true,
    moneyDelta: 2 // EDGE CASE: if victim only has 1 or 0 coins
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
