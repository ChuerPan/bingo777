// 游戏配置模块
const GameConfig = {
  defaultConfig: {
    rtp: 95.0,
    volatility: 5,
    hitFrequency: 25,
    maxMultiplier: 1000,
    baseWeight: 50,
    rewardWeight: 10,
    jokerWeight: 5,
    payoutFactor: 1,
    houseEdge: 5
  },

  currentConfig: null,

  init() {
    this.currentConfig = { ...this.defaultConfig };
  },

  getConfig() {
    return this.currentConfig;
  },

  updateConfig(newConfig) {
    this.currentConfig = { ...this.currentConfig, ...newConfig };
  },

  validateConfig(config) {
    const errors = [];
    if (config.rtp < 80 || config.rtp > 99) errors.push('RTP范围必须在80-99之间');
    if (config.volatility < 1 || config.volatility > 10) errors.push('波动率范围必须在1-10之间');
    if (config.hitFrequency < 5 || config.hitFrequency > 50) errors.push('命中率范围必须在5-50之间');
    return errors;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameConfig;
}
