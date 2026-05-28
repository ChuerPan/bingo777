// 游戏配置文件

// 符号配置 - 重新设计以符合RTP要求
export const SYMBOL_CONFIG = {
  '🃏': { name: '小丑', baseReward: 0.5, weight: 2, isJoker: true, consecutive3: 2, consecutive4: 5, consecutive5: 15, consecutive6: 40 },
  '💰': { name: '金币', baseReward: 0.05, weight: 25, consecutive3: 0.3, consecutive4: 0.8, consecutive5: 2, consecutive6: 6 },
  '💎': { name: '钻石', baseReward: 0.08, weight: 18, consecutive3: 0.5, consecutive4: 1.2, consecutive5: 3, consecutive6: 10 },
  '👑': { name: '皇冠', baseReward: 0.1, weight: 3, isSpecial: true, consecutive3: 0.8, consecutive4: 2, consecutive5: 5, consecutive6: 15 },
  '⭐': { name: '星星', baseReward: 0.06, weight: 22, consecutive3: 0.4, consecutive4: 1, consecutive5: 2.5, consecutive6: 8 },
  '❤️': { name: '爱心', baseReward: 0.04, weight: 24, consecutive3: 0.25, consecutive4: 0.7, consecutive5: 1.8, consecutive6: 5 },
  '🔔': { name: '铃铛', baseReward: 0.03, weight: 28, consecutive3: 0.2, consecutive4: 0.5, consecutive5: 1.5, consecutive6: 4 },
  '🟠': { name: '橙子', baseReward: 0.02, weight: 32, consecutive3: 0.15, consecutive4: 0.4, consecutive5: 1.2, consecutive6: 3 },
  '🔶': { name: '条纹', baseReward: 0.01, weight: 35, consecutive3: 0.1, consecutive4: 0.3, consecutive5: 1, consecutive6: 2 }
};

// 所有符号的数组
export const SYMBOLS = Object.keys(SYMBOL_CONFIG);

// 游戏配置 - 可配置项
export const gameConfig = {
  rtp: 95.0,          // 返还率 (Return to Player)
  volatility: 5,      // 波动率 (1-10)
  houseEdge: 5,       // 庄家优势
  hitRate: 20,        // 命中率 - 中奖概率百分比 (新增)
  maxWin: 100,        // 最大单次赢得倍数 (新增)
  bonusFrequency: 0    // 奖励触发频率 (新增)
};

// 游戏常量
export const GAME_CONSTANTS = {
  SYMBOLS_PER_REEL: 20,
  VISIBLE_ROWS: 4,
  REEL_COUNT: 6,
  INITIAL_BALANCE: 10000,
  MIN_BET: 100,
  MAX_BET: 10000,
  BET_STEP: 100
};
