// 游戏配置文件

// 符号配置 - 定义所有游戏符号的属性和奖励
export const SYMBOL_CONFIG = {
  '🃏': { name: '小丑', baseReward: 1, weight: 2, isJoker: true, consecutive3: 5, consecutive4: 15, consecutive5: 50, consecutive6: 200 },
  '💰': { name: '金币', baseReward: 0.1, weight: 25, consecutive3: 0.5, consecutive4: 1.5, consecutive5: 5, consecutive6: 20 },
  '💎': { name: '钻石', baseReward: 0.2, weight: 15, consecutive3: 0.8, consecutive4: 2.5, consecutive5: 8, consecutive6: 35 },
  '👑': { name: '皇冠', baseReward: 0.5, weight: 3, isSpecial: true, consecutive3: 2, consecutive4: 5, consecutive5: 15, consecutive6: 50 },
  '⭐': { name: '星星', baseReward: 0.15, weight: 20, consecutive3: 0.6, consecutive4: 2, consecutive5: 6, consecutive6: 25 },
  '❤️': { name: '爱心', baseReward: 0.12, weight: 22, consecutive3: 0.55, consecutive4: 1.8, consecutive5: 5.5, consecutive6: 22 },
  '🔔': { name: '铃铛', baseReward: 0.08, weight: 28, consecutive3: 0.4, consecutive4: 1.2, consecutive5: 4, consecutive6: 18 },
  '🟠': { name: '橙子', baseReward: 0.05, weight: 32, consecutive3: 0.3, consecutive4: 1, consecutive5: 3, consecutive6: 15 },
  '🔶': { name: '条纹', baseReward: 0.03, weight: 35, consecutive3: 0.25, consecutive4: 0.8, consecutive5: 2.5, consecutive6: 12 }
};

// 所有符号的数组
export const SYMBOLS = Object.keys(SYMBOL_CONFIG);

// 游戏配置 - 全局设置
export const gameConfig = {
  rtp: 95.0,
  volatility: 5,
  houseEdge: 5
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
