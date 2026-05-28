// 轮盘效果模块
import { SYMBOL_CONFIG, SYMBOLS, GAME_CONSTANTS } from './config.js';
import { gameState } from './gameState.js';

// 获取随机符号 - 根据配置和波动率计算
export function getRandomSymbol() {
  let totalWeight = Object.values(SYMBOL_CONFIG).reduce((sum, cfg) => sum + cfg.weight, 0);
  const config = gameState.config;
  
  // 根据波动率调整权重
  if (config.volatility > 7) {
    // 高波动：稀有高奖励图案更容易出现
    totalWeight = Object.values(SYMBOL_CONFIG).reduce((sum, cfg) => {
      if (cfg.isSpecial || cfg.isJoker || cfg.consecutive6 >= 30) {
        return sum + cfg.weight * 2;
      }
      return sum + cfg.weight * 0.7;
    }, 0);
  } else if (config.volatility < 3) {
    // 低波动：普通图案更容易出现
    totalWeight = Object.values(SYMBOL_CONFIG).reduce((sum, cfg) => {
      if (cfg.isSpecial || cfg.isJoker || cfg.consecutive6 >= 30) {
        return sum + cfg.weight * 0.4;
      }
      return sum + cfg.weight * 1.3;
    }, 0);
  }

  let rand = Math.random() * totalWeight;
  
  for (const [symbol, cfg] of Object.entries(SYMBOL_CONFIG)) {
    let weight = cfg.weight;
    
    if (config.volatility > 7) {
      if (cfg.isSpecial || cfg.isJoker || cfg.consecutive6 >= 30) {
        weight *= 2;
      } else {
        weight *= 0.7;
      }
    } else if (config.volatility < 3) {
      if (cfg.isSpecial || cfg.isJoker || cfg.consecutive6 >= 30) {
        weight *= 0.4;
      } else {
        weight *= 1.3;
      }
    }
    
    rand -= weight;
    if (rand <= 0) return symbol;
  }
  return SYMBOLS[0];
}

// 初始化所有轮盘
export function initReels() {
  for (let i = 0; i < GAME_CONSTANTS.REEL_COUNT; i++) {
    const reel = document.getElementById(`reel${i}`);
    let content = '';
    for (let j = 0; j < GAME_CONSTANTS.SYMBOLS_PER_REEL; j++) {
      const symbol = getRandomSymbol();
      const isCrown = symbol === '👑';
      const isJoker = symbol === '🃏';
      content += `<div class="symbol${isCrown ? ' crown' : ''}${isJoker ? ' joker' : ''}">${symbol}</div>`;
    }
    reel.innerHTML = content;
    reel.style.transform = 'translateY(0)';
  }
}

// 动画单个轮盘
export function animateReel(reelIndex, callback) {
  const reel = document.getElementById(`reel${reelIndex}`);
  const columnSymbols = [];
  
  for (let i = 0; i < GAME_CONSTANTS.SYMBOLS_PER_REEL; i++) {
    columnSymbols.push(getRandomSymbol());
  }
  
  let content = '';
  for (const symbol of columnSymbols) {
    const isCrown = symbol === '👑';
    const isJoker = symbol === '🃏';
    content += `<div class="symbol${isCrown ? ' crown' : ''}${isJoker ? ' joker' : ''}">${symbol}</div>`;
  }
  reel.innerHTML = content;
  
  let currentY = 0;
  const spinDuration = 1500 + reelIndex * 200;
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / spinDuration, 1);
    
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const targetY = -(GAME_CONSTANTS.SYMBOLS_PER_REEL - GAME_CONSTANTS.VISIBLE_ROWS) * 80;
    currentY = easeOut * targetY;
    
    reel.style.transform = `translateY(${currentY}px)`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      const visibleSymbols = columnSymbols.slice(-GAME_CONSTANTS.VISIBLE_ROWS);
      callback(visibleSymbols);
    }
  }
  
  animate();
}
