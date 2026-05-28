// 图案和奖池规则模块
const Symbols = {
  SYMBOLS: {
    base: ['🔷', '🔶', '🔸', '🟠', '🍉', '🍇', '🍊', '🍋', '🔴'],
    reward: ['💰', '💎', '👑', '⭐', '❤️', '🍀'],
    joker: '🃏'
  },

  PAYTABLE: {
    '💰': [0, 0, 10, 50, 200, 1000],
    '💎': [0, 0, 5, 25, 100, 500],
    '👑': [0, 0, 4, 20, 80, 400],
    '⭐': [0, 0, 3, 15, 60, 300],
    '❤️': [0, 0, 2, 10, 40, 200],
    '🍀': [0, 0, 1, 5, 20, 100],
    '🍒': [0, 0, 1, 4, 15, 80],
    '🔔': [0, 0, 1, 3, 10, 50],
    '🔴': [0, 0, 0.5, 2, 8, 40],
    '🍋': [0, 0, 0.5, 2, 6, 30],
    '🍊': [0, 0, 0.5, 2, 5, 25],
    '🍇': [0, 0, 0.5, 1, 4, 20],
    '🍉': [0, 0, 0.5, 1, 3, 15],
    '🔷': [0, 0, 0.5, 1, 2, 10],
    '🔶': [0, 0, 0.5, 1, 2, 8],
    '🔸': [0, 0, 0.5, 1, 2, 5],
    '🟠': [0, 0, 0.5, 1, 2, 3]
  },

  isRewardSymbol(symbol) {
    return this.SYMBOLS.reward.includes(symbol);
  },

  isJoker(symbol) {
    return symbol === this.SYMBOLS.joker;
  },

  getMultiplier(symbol, count) {
    if (!this.PAYTABLE[symbol]) return 0;
    return this.PAYTABLE[symbol][count - 1] || 0;
  },

  getRandomSymbol(config) {
    const totalWeight = config.baseWeight + config.rewardWeight + config.jokerWeight;
    const rand = Math.random() * totalWeight;

    if (rand < config.jokerWeight) {
      return this.SYMBOLS.joker;
    } else if (rand < config.jokerWeight + config.rewardWeight) {
      return this.SYMBOLS.reward[Math.floor(Math.random() * this.SYMBOLS.reward.length)];
    } else {
      return this.SYMBOLS.base[Math.floor(Math.random() * this.SYMBOLS.base.length)];
    }
  },

  findLongestMatch(symbols) {
    if (symbols.length === 0) return [];

    const match = [symbols[0]];
    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i] === match[0] || symbols[i] === '🃏' || match[0] === '🃏') {
        if (match[0] === '🃏' && symbols[i] !== '🃏') {
          match[0] = symbols[i];
        }
        match.push(symbols[i]);
      } else {
        break;
      }
    }

    return match;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Symbols;
}
