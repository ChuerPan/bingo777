// 奖池规则模块 - 负责检测和计算奖励
import { SYMBOL_CONFIG, GAME_CONSTANTS } from './config.js';
import { gameState } from './gameState.js';

// 分析矩阵 - 找出所有匹配的符号组合
export function analyzeWinningMatrix(matrix) {
  let totalWin = 0;
  let winDetails = [];
  const winningGroups = [];
  const allCrownCells = [];
  const allJokerCells = [];
  let crownCount = 0;
  let jokerCount = 0;

  // 统计皇冠和小丑的位置
  for (let row = 0; row < GAME_CONSTANTS.VISIBLE_ROWS; row++) {
    for (let col = 0; col < GAME_CONSTANTS.REEL_COUNT; col++) {
      if (matrix[col][row] === '👑') {
        crownCount++;
        allCrownCells.push({ row, col });
      }
      if (matrix[col][row] === '🃏') {
        jokerCount++;
        allJokerCells.push({ row, col });
      }
    }
  }

  // 按排计算连续相同图案
  for (let row = 0; row < GAME_CONSTANTS.VISIBLE_ROWS; row++) {
    let col = 0;
    while (col < GAME_CONSTANTS.REEL_COUNT) {
      let baseSymbol = matrix[col][row];
      let consecutiveCount = 1;
      let groupJokerCount = 0;
      
      // 如果第一个是小丑，需要找最近的非小丑作为基础图案
      if (SYMBOL_CONFIG[baseSymbol].isJoker) {
        groupJokerCount++;
        // 找后面的非小丑图案
        for (let searchCol = col + 1; searchCol < GAME_CONSTANTS.REEL_COUNT; searchCol++) {
          if (!SYMBOL_CONFIG[matrix[searchCol][row]].isJoker) {
            baseSymbol = matrix[searchCol][row];
            break;
          }
        }
      }
      
      // 统计连续匹配的数量（包括小丑）
      let nextCol = col + 1;
      while (nextCol < GAME_CONSTANTS.REEL_COUNT) {
        const nextSymbol = matrix[nextCol][row];
        if (nextSymbol === baseSymbol || SYMBOL_CONFIG[nextSymbol].isJoker) {
          consecutiveCount++;
          if (SYMBOL_CONFIG[nextSymbol].isJoker) {
            groupJokerCount++;
          }
        } else {
          break;
        }
        nextCol++;
      }
      
      // 只有连续3个及以上才有奖励
      if (consecutiveCount >= 3) {
        const cfg = SYMBOL_CONFIG[baseSymbol];
        let multiplier = 0;
        
        if (consecutiveCount >= 6) multiplier = cfg.consecutive6;
        else if (consecutiveCount >= 5) multiplier = cfg.consecutive5;
        else if (consecutiveCount >= 4) multiplier = cfg.consecutive4;
        else if (consecutiveCount >= 3) multiplier = cfg.consecutive3;
        
        // 每个连接的小丑都让奖励翻倍
        const jokerMultiplier = Math.pow(2, groupJokerCount);
        multiplier *= jokerMultiplier;
        
        const winAmount = multiplier * gameState.currentBet;
        
        // 记录获胜组
        const groupCells = [];
        for (let i = 0; i < consecutiveCount; i++) {
          groupCells.push({ row, col: col + i });
        }
        
        winningGroups.push({
          symbol: baseSymbol,
          consecutiveCount,
          groupJokerCount,
          multiplier,
          winAmount,
          cells: groupCells
        });
        
        winDetails.push(`第${row + 1}排 ${baseSymbol}×${consecutiveCount}${groupJokerCount > 0 ? '+🃏×' + groupJokerCount : ''}: ${winAmount}`);
        totalWin += winAmount;
      }
      
      col += consecutiveCount;
    }
  }

  // 皇冠加成
  const crownMultiplier = Math.pow(2, crownCount);
  if (crownCount > 0) {
    totalWin *= crownMultiplier;
    winDetails.push(`皇冠加成: ×${crownMultiplier} (${crownCount}个)`);
  }

  return {
    totalWin,
    winDetails,
    winningGroups,
    allCrownCells,
    allJokerCells,
    crownCount,
    jokerCount,
    crownMultiplier
  };
}

// 应用奖励 - 更新余额
export function applyWin(totalWin) {
  if (totalWin > 0) {
    gameState.balance += totalWin;
  }
}
