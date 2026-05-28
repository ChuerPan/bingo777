// 主游戏逻辑模块
const Game = {
  balance: 1000,
  currentBet: 1,
  isSpinning: false,
  config: null,

  init(GameConfigModule, SymbolsModule, ReelsModule) {
    this.GameConfig = GameConfigModule;
    this.Symbols = SymbolsModule;
    this.Reels = ReelsModule;

    this.GameConfig.init();
    this.config = this.GameConfig.getConfig();
    this.Reels.init(this.Symbols, this.config);

    this.setupEventListeners();
    this.updateBalance();
  },

  setupEventListeners() {
    document.querySelectorAll('.bet-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentBet = parseInt(btn.dataset.bet);
        this.updateBalance();
      });
    });

    document.getElementById('spinBtn').addEventListener('click', () => this.spinReels());
    document.getElementById('applyBtn').addEventListener('click', () => this.applyConfig());

    document.getElementById('rtp').addEventListener('input', (e) => {
      document.getElementById('houseEdge').value = (100 - parseFloat(e.target.value)).toFixed(1);
    });

    document.getElementById('houseEdge').addEventListener('input', (e) => {
      document.getElementById('rtp').value = (100 - parseFloat(e.target.value)).toFixed(1);
    });
  },

  spinReels() {
    if (this.isSpinning || this.balance < this.currentBet) return;

    this.isSpinning = true;
    document.getElementById('spinBtn').disabled = true;
    this.balance -= this.currentBet;
    this.updateBalance();

    const resultSymbols = [];
    let delay = 0;

    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.Reels.animateReel(i, (symbol) => {
          resultSymbols.push(symbol);
          if (resultSymbols.length === 6) {
            setTimeout(() => {
              this.checkWin(resultSymbols);
              this.isSpinning = false;
              document.getElementById('spinBtn').disabled = false;
            }, 500);
          }
        });
      }, delay);
      delay += 300;
    }
  },

  checkWin(symbols) {
    let totalWin = 0;
    let winDetails = [];

    for (let startCol = 0; startCol <= 3; startCol++) {
      const matched = this.Symbols.findLongestMatch(symbols.slice(startCol));
      if (matched.length >= 3) {
        const baseSymbol = matched.filter(s => s !== '🃏')[0] || matched[0];
        const multiplier = this.Symbols.getMultiplier(baseSymbol, matched.length);
        const winAmount = Math.round(multiplier * this.currentBet * this.config.payoutFactor);
        totalWin += winAmount;
        if (winAmount > 0) {
          winDetails.push(`${baseSymbol} × ${matched.length} = ${winAmount}`);
        }
      }
    }

    if (totalWin > 0) {
      this.balance += totalWin;
      document.getElementById('resultText').textContent = `🎉 恭喜中奖! ${winDetails.join(' + ')}`;
      document.getElementById('resultAmount').textContent = `+${totalWin}`;
      document.getElementById('resultAmount').className = 'result-amount win';
    } else {
      document.getElementById('resultText').textContent = '😔 未中奖，再接再厉!';
      document.getElementById('resultAmount').textContent = `-${this.currentBet}`;
      document.getElementById('resultAmount').className = 'result-amount lose';
    }

    this.updateBalance();
  },

  updateBalance() {
    document.getElementById('balance').textContent = this.balance;
    document.getElementById('currentBet').textContent = this.currentBet;
  },

  applyConfig() {
    const newConfig = {
      rtp: parseFloat(document.getElementById('rtp').value),
      volatility: parseFloat(document.getElementById('volatility').value),
      hitFrequency: parseFloat(document.getElementById('hitFrequency').value),
      maxMultiplier: parseFloat(document.getElementById('maxMultiplier').value),
      baseWeight: parseFloat(document.getElementById('baseWeight').value),
      rewardWeight: parseFloat(document.getElementById('rewardWeight').value),
      jokerWeight: parseFloat(document.getElementById('jokerWeight').value),
      payoutFactor: parseFloat(document.getElementById('payoutFactor').value),
      houseEdge: parseFloat(document.getElementById('houseEdge').value)
    };

    this.GameConfig.updateConfig(newConfig);
    this.config = this.GameConfig.getConfig();

    document.getElementById('houseEdge').value = (100 - this.config.rtp).toFixed(1);
    document.getElementById('summaryRtp').textContent = `${this.config.rtp}%`;
    document.getElementById('summaryVol').textContent = this.config.volatility;
    document.getElementById('summaryHit').textContent = `${this.config.hitFrequency}%`;
    document.getElementById('summaryMax').textContent = `${this.config.maxMultiplier}x`;

    const summary = document.getElementById('configSummary');
    summary.classList.add('show');
    setTimeout(() => summary.classList.remove('show'), 3000);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
