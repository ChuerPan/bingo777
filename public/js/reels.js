// 轮盘效果模块
const Reels = {
  reelCount: 6,
  reelContents: [],

  init(SymbolsModule, config) {
    this.Symbols = SymbolsModule;
    this.config = config;
    this.reelContents = [];
    
    for (let i = 0; i < this.reelCount; i++) {
      const reel = document.getElementById(`reel${i}`);
      let content = '';
      for (let j = 0; j < 20; j++) {
        const symbol = this.Symbols.getRandomSymbol(this.config);
        const isReward = this.Symbols.isRewardSymbol(symbol);
        content += `<div class="symbol ${isReward ? 'reward' : ''}">${symbol}</div>`;
      }
      reel.innerHTML = content;
      this.reelContents.push(reel.innerHTML);
    }
  },

  animateReel(reelIndex, callback) {
    const reel = document.getElementById(`reel${reelIndex}`);
    const spinCount = 15 + Math.floor(Math.random() * 10);
    let currentCount = 0;

    const spin = () => {
      if (currentCount >= spinCount) {
        const finalSymbol = this.Symbols.getRandomSymbol(this.config);
        const isReward = this.Symbols.isRewardSymbol(finalSymbol);
        reel.innerHTML = `<div class="symbol ${isReward ? 'reward' : ''}">${finalSymbol}</div>`;
        callback(finalSymbol);
        return;
      }

      const symbol = this.Symbols.getRandomSymbol(this.config);
      const isReward = this.Symbols.isRewardSymbol(symbol);
      reel.innerHTML = `<div class="symbol ${isReward ? 'reward' : ''}">${symbol}</div>`;
      currentCount++;

      setTimeout(spin, 80);
    };

    spin();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Reels;
}
