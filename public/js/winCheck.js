// 奖池规则模块 - 负责检测和计算奖励
import { SYMBOL_CONFIG, GAME_CONSTANTS } from './config.js';
import { gameState } from './gameState.js';

// 8 方向偏移量
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0], [1, 1]
];

// 使用 BFS 找出连通分量
function findConnectedComponent(matrix, startCol, startRow, visited, baseSymbol) {
  const queue = [[startCol, startRow]];
  const component = [];
  let groupJokerCount = 0;
  
  while (queue.length > 0) {
    const [col, row] = queue.shift();
    
    // 检查边界
    if (col < 0 || col >= GAME_CONSTANTS.REEL_COUNT || 
        row < 0 || row >= GAME_CONSTANTS.VISIBLE_ROWS) {
      continue;
    }
    
    // 检查是否已访问
    const key = `${col},${row}`;
    if (visited.has(key)) {
      continue;
    }
    
    const symbol = matrix[col][row];
    const isMatch = symbol === baseSymbol || SYMBOL_CONFIG[symbol].isJoker;
    
    if (isMatch) {
      visited.add(key);
      component.push({ col, row, symbol });
      
      if (SYMBOL_CONFIG[symbol].isJoker) {
        groupJokerCount++;
      }
      
      // 探索 8 个方向
      for (const [dRow, dCol] of DIRECTIONS) {
        queue.push([col + dCol, row + dRow]);
      }
    }
  }
  
  return { component, groupJokerCount };
}

// 分析矩阵 - 找出所有 8 方向连通的符号组合
export function analyzeWinningMatrix(matrix) {
  let totalWin = 0;
  let winDetails = [];
  const winningGroups = [];
  const allCrownCells = [];
  const allJokerCells = [];
  let crownCount = 0;
  let jokerCount = 0;
  const visited = new Set();

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

  // 寻找所有连通分量
  for (let row = 0; row < GAME_CONSTANTS.VISIBLE_ROWS; row++) {
    for (let col = 0; col < GAME_CONSTANTS.REEL_COUNT; col++) {
      const key = `${col},${row}`;
      if (visited.has(key)) {
        continue;
      }
      
      let baseSymbol = matrix[col][row];
      
      // 如果当前是小丑，先确定基础符号
      if (SYMBOL_CONFIG[baseSymbol].isJoker) {
        // 查找周围是否有非小丑符号
        let found = false;
        for (const [dRow, dCol] of DIRECTIONS) {
          const nCol = col + dCol;
          const nRow = row + dRow;
          if (nCol >= 0 && nCol < GAME_CONSTANTS.REEL_COUNT && 
              nRow >= 0 && nRow < GAME_CONSTANTS.VISIBLE_ROWS) {
            const neighbor = matrix[nCol][nRow];
            if (!SYMBOL_CONFIG[neighbor].isJoker) {
              baseSymbol = neighbor;
              found = true;
              break;
            }
          }
        }
        // 如果周围全是小丑，就用小丑作为基础符号
        if (!found) {
          baseSymbol = '🃏';
        }
      }
      
      // 找连通分量
      const { component, groupJokerCount } = findConnectedComponent(
        matrix, col, row, visited, baseSymbol
      );
      
      const connectedCount = component.length;
      
      // 只有连通 3 个及以上才有奖励
      if (connectedCount >= 3) {
        const cfg = SYMBOL_CONFIG[baseSymbol];
        let multiplier = 0;
        
        if (connectedCount >= 6) multiplier = cfg.consecutive6;
        else if (connectedCount >= 5) multiplier = cfg.consecutive5;
        else if (connectedCount >= 4) multiplier = cfg.consecutive4;
        else if (connectedCount >= 3) multiplier = cfg.consecutive3;
        
        // 每个连接的小丑都让奖励翻倍
        const jokerMultiplier = Math.pow(2, groupJokerCount);
        multiplier *= jokerMultiplier;
        
        const winAmount = multiplier * gameState.currentBet;
        
        // 转换格式
        const groupCells = component.map(c => ({ col: c.col, row: c.row }));
        
        winningGroups.push({
          symbol: baseSymbol,
          consecutiveCount: connectedCount,
          groupJokerCount,
          multiplier,
          winAmount,
          cells: groupCells
        });
        
        winDetails.push(`8方向连通 ${baseSymbol}×${connectedCount}${groupJokerCount > 0 ? '+🃏×' + groupJokerCount : ''}: ${winAmount}`);
        totalWin += winAmount;
      }
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
