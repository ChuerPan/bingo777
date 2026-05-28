// 智能中奖策略模块
import { gameConfig, SYMBOL_CONFIG } from './config.js';

// 智能策略状态
export const strategyState = {
  totalSpins: 0,               // 总旋转次数
  totalWins: 0,                // 总中奖次数
  totalInvested: 0,            // 总投入
  totalPayout: 0,              // 总支出
  currentBalance: 10000,       // 当前余额
  initialBalance: 10000,       // 初始余额
  strategyPhase: 'newbie',     // 当前阶段: newbie, growth, stable
  phaseHistory: [],            // 阶段历史记录
  currentPhaseDuration: 0,     // 当前阶段持续轮数
  recentWins: [],              // 最近N次中奖情况
  winStreak: 0,                // 连赢次数
  loseStreak: 0                // 连输次数
};

// 策略配置 - 可调节的参数
export const strategyConfig = {
  newbieRounds: 10,            // 新手期轮数
  newbieBoostRTP: 120,         // 新手期RTP
  newbieBoostVol: 8,           // 新手期波动率
  growthPhaseLength: 20,       // 成长期长度
  stablePhaseLength: 30,       // 平缓期长度
  profitThreshold: 5000,       // 盈利触发平缓期的阈值
  lossRecoveryThreshold: 2000, // 亏损触发奖励期的阈值
  phaseAdjustmentSpeed: 0.1    // 阶段调整平滑度
};

// 初始化策略状态
export function initStrategyState() {
  Object.assign(strategyState, {
    totalSpins: 0,
    totalWins: 0,
    totalInvested: 0,
    totalPayout: 0,
    currentBalance: 10000,
    initialBalance: 10000,
    strategyPhase: 'newbie',
    phaseHistory: [],
    currentPhaseDuration: 0,
    recentWins: [],
    winStreak: 0,
    loseStreak: 0
  });
}

// 更新策略状态
export function updateStrategyState(betAmount, winAmount, newBalance) {
  strategyState.totalSpins++;
  strategyState.totalInvested += betAmount;
  
  if (winAmount > 0) {
    strategyState.totalWins++;
    strategyState.totalPayout += winAmount;
    strategyState.winStreak++;
    strategyState.loseStreak = 0;
    strategyState.recentWins.push(winAmount);
    if (strategyState.recentWins.length > 20) {
      strategyState.recentWins.shift();
    }
  } else {
    strategyState.winStreak = 0;
    strategyState.loseStreak++;
  }
  
  strategyState.currentBalance = newBalance;
  strategyState.currentPhaseDuration++;
  
  // 检查是否需要切换阶段
  checkAndSwitchPhase();
}

// 检查并切换阶段
function checkAndSwitchPhase() {
  const currentProfit = strategyState.currentBalance - strategyState.initialBalance;
  const totalRTP = strategyState.totalInvested > 0 ? 
    (strategyState.totalPayout / strategyState.totalInvested) * 100 : 0;
  
  // 新手期判断
  if (strategyState.strategyPhase === 'newbie') {
    if (strategyState.totalSpins >= strategyConfig.newbieRounds) {
      switchPhase('growth');
      return;
    }
  }
  
  // 成长期判断
  if (strategyState.strategyPhase === 'growth') {
    // 盈利过多进入平缓期
    if (currentProfit > strategyConfig.profitThreshold) {
      switchPhase('stable');
      return;
    }
    // 到时间也进入平缓期
    if (strategyState.currentPhaseDuration >= strategyConfig.growthPhaseLength) {
      switchPhase('stable');
      return;
    }
  }
  
  // 平缓期判断
  if (strategyState.strategyPhase === 'stable') {
    // 亏损过多进入成长期
    if (currentProfit < -strategyConfig.lossRecoveryThreshold) {
      switchPhase('growth');
      return;
    }
    // 到时间也进入成长期
    if (strategyState.currentPhaseDuration >= strategyConfig.stablePhaseLength) {
      switchPhase('growth');
      return;
    }
  }
}

// 切换阶段
function switchPhase(newPhase) {
  strategyState.phaseHistory.push({
    phase: strategyState.strategyPhase,
    duration: strategyState.currentPhaseDuration,
    profit: strategyState.currentBalance - strategyState.initialBalance,
    RTP: strategyState.totalInvested > 0 ? 
      (strategyState.totalPayout / strategyState.totalInvested) * 100 : 0
  });
  strategyState.strategyPhase = newPhase;
  strategyState.currentPhaseDuration = 0;
}

// 获取当前策略下的游戏参数调整
export function getStrategyAdjustments() {
  const phase = strategyState.strategyPhase;
  let rtpMultiplier = 1;
  let volatilityMultiplier = 1;
  let hitRateMultiplier = 1;
  let winAmountMultiplier = 1;
  
  switch (phase) {
    case 'newbie':
      // 新手期：显著提升，确保中奖
      rtpMultiplier = strategyConfig.newbieBoostRTP / gameConfig.rtp;
      volatilityMultiplier = strategyConfig.newbieBoostVol / gameConfig.volatility;
      hitRateMultiplier = 1.8;  // 命中率大幅提升
      winAmountMultiplier = 1.5; // 奖励适度提升
      break;
      
    case 'growth':
      // 成长期：积极策略，保持游戏趣味性
      const currentProfit = strategyState.currentBalance - strategyState.initialBalance;
      const profitPercent = (currentProfit / strategyState.initialBalance);
      
      if (profitPercent < 0) {
        // 亏损状态：提升返还率
        rtpMultiplier = Math.min(1.2, 1 + Math.abs(profitPercent));
        hitRateMultiplier = 1.3;
      } else {
        // 盈利状态：适度提高
        rtpMultiplier = 1.05;
        volatilityMultiplier = 1.2;
        hitRateMultiplier = 1.1;
      }
      break;
      
    case 'stable':
      // 平缓期：回归标准，适度降低
      rtpMultiplier = 0.95;
      volatilityMultiplier = 0.8;
      hitRateMultiplier = 0.9;
      
      // 检查连输情况，如果连输太多，适度反弹
      if (strategyState.loseStreak > 5) {
        hitRateMultiplier = 1.2;
      }
      break;
  }
  
  return {
    phase,
    rtpMultiplier,
    volatilityMultiplier,
    hitRateMultiplier,
    winAmountMultiplier,
    stats: {
      totalSpins: strategyState.totalSpins,
      currentPhaseDuration: strategyState.currentPhaseDuration,
      currentProfit: strategyState.currentBalance - strategyState.initialBalance,
      currentRTP: strategyState.totalInvested > 0 ? 
        (strategyState.totalPayout / strategyState.totalInvested) * 100 : 0
    }
  };
}

// 根据策略调整中奖结果
export function applyStrategyToWin(originalWin, groups, matrix) {
  const adjustments = getStrategyAdjustments();
  
  let finalWin = originalWin;
  let modifiedGroups = [...groups];
  
  // 新手期确保中奖
  if (adjustments.phase === 'newbie' && originalWin === 0 && groups.length === 0) {
    const result = createArtificialWin(matrix);
    finalWin = result.winAmount;
    modifiedGroups = result.groups;
  }
  
  // 应用奖金倍数调整
  finalWin = Math.round(finalWin * adjustments.winAmountMultiplier);
  
  // 应用RTP限制 - 防止偏离太远
  const targetTotalPayout = (strategyState.totalInvested * adjustments.rtpMultiplier) / 100;
  const currentPayoutRatio = strategyState.totalInvested > 0 ? 
    strategyState.totalPayout / targetTotalPayout : 1;
  
  if (currentPayoutRatio > 1.1) {
    // 支付太多，适度减少
    finalWin = Math.round(finalWin * 0.9);
  } else if (currentPayoutRatio < 0.9) {
    // 支付太少，适度增加
    finalWin = Math.round(finalWin * 1.1);
  }
  
  return {
    finalWin,
    modifiedGroups,
    adjustments
  };
}

// 创建人为中奖（新手期使用）
function createArtificialWin(matrix) {
  // 找到最左边可以连起来的符号
  let bestGroup = null;
  let bestSymbol = null;
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const symbol = matrix[col]?.[row];
      if (!symbol || symbol === '🃏') continue;
      
      const group = tryBuildGroup(matrix, col, row, symbol);
      if (group && (!bestGroup || group.length > bestGroup.length)) {
        bestGroup = group;
        bestSymbol = symbol;
      }
    }
  }
  
  // 如果没找到，就随便找个
  if (!bestGroup) {
    bestGroup = [
      { col: 0, row: 1 },
      { col: 1, row: 1 },
      { col: 2, row: 1 }
    ];
    bestSymbol = '💰';
  }
  
  const winConfig = SYMBOL_CONFIG[bestSymbol] || SYMBOL_CONFIG['💰'];
  const multiplier = bestGroup.length >= 6 ? winConfig.consecutive6 :
    bestGroup.length >= 5 ? winConfig.consecutive5 :
    bestGroup.length >= 4 ? winConfig.consecutive4 : winConfig.consecutive3;
  
  const winAmount = Math.round(multiplier * 100); // 默认投注100
  
  return {
    groups: [{
      symbol: bestSymbol,
      consecutiveCount: bestGroup.length,
      groupJokerCount: 0,
      multiplier,
      winAmount,
      cells: bestGroup
    }],
    winAmount
  };
}

// 尝试构建连续组
function tryBuildGroup(matrix, startCol, startRow, targetSymbol) {
  const group = [];
  const visited = new Set();
  const queue = [{ col: startCol, row: startRow }];
  
  while (queue.length > 0 && group.length < 6) {
    const { col, row } = queue.shift();
    const key = `${col},${row}`;
    
    if (visited.has(key) || col < 0 || col >= 6 || row < 0 || row >= 4) {
      continue;
    }
    
    const symbol = matrix[col]?.[row];
    if (!symbol) continue;
    
    if (symbol === targetSymbol || symbol === '🃏') {
      visited.add(key);
      group.push({ col, row });
      
      // 向右扩展（避免回头）
      queue.push({ col: col + 1, row });
      queue.push({ col: col + 1, row: row - 1 });
      queue.push({ col: col + 1, row: row + 1 });
      queue.push({ col: col, row: row - 1 });
      queue.push({ col: col, row: row + 1 });
    }
  }
  
  return group.length >= 3 ? group : null;
}
