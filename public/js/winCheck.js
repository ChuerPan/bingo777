// 奖池规则模块 - 负责检测和计算奖励
import { SYMBOL_CONFIG, GAME_CONSTANTS } from './config.js';
import { gameState } from './gameState.js';

// 只向右扩展的方向（不包括向左回溯）
const RIGHT_DIRECTIONS = [
  [0, 1],   // 右
  [-1, 1],  // 右上
  [1, 1],   // 右下
  [-1, 0],  // 上
  [1, 0]    // 下
];

// 8方向（用于判断是否连接）
const ALL_DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0], [1, 1]
];

// 检查两个格子是否8方向相连
function areConnected(col1, row1, col2, row2) {
  const dCol = col2 - col1;
  const dRow = row2 - row1;
  return Math.abs(dCol) <= 1 && Math.abs(dRow) <= 1 && !(dCol === 0 && dRow === 0);
}

// 使用BFS找连通分量（只向右扩展）
function findConnectedComponent(matrix, startCol, startRow, visited, baseSymbol) {
  const component = [];
  const groupJokerCount = { count: 0 };
  const queue = [[startCol, startRow, startCol]]; // [col, row, leftMostCol]
  
  while (queue.length > 0) {
    const [col, row, leftMostCol] = queue.shift();
    
    if (col < 0 || col >= GAME_CONSTANTS.REEL_COUNT || 
        row < 0 || row >= GAME_CONSTANTS.VISIBLE_ROWS) {
      continue;
    }
    
    const key = `${col},${row}`;
    if (visited.has(key)) {
      continue;
    }
    
    const symbol = matrix[col][row];
    const isMatch = symbol === baseSymbol || SYMBOL_CONFIG[symbol].isJoker;
    
    if (isMatch) {
      visited.add(key);
      component.push({ col, row, symbol, leftMostCol });
      
      if (SYMBOL_CONFIG[symbol].isJoker) {
        groupJokerCount.count++;
      }
      
      // 只向右扩展
      for (const [dRow, dCol] of RIGHT_DIRECTIONS) {
        const newLeftMost = dCol < 0 ? col : leftMostCol;
        queue.push([col + dCol, row + dRow, newLeftMost]);
      }
    }
  }
  
  return { component, groupJokerCount: groupJokerCount.count };
}

// 检查连通分量是否从左边列开始
function isFromLeftEdge(component) {
  return component.some(cell => cell.col === 0);
}

// 分析矩阵 - 找出所有从左边开始的8方向连通组合
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

  // 只从左边列开始寻找起点
  for (let col = 0; col < GAME_CONSTANTS.REEL_COUNT; col++) {
    for (let row = 0; row < GAME_CONSTANTS.VISIBLE_ROWS; row++) {
      const key = `${col},${row}`;
      if (visited.has(key)) {
        continue;
      }
      
      let baseSymbol = matrix[col][row];
      
      // 如果当前是小丑，先确定基础符号
      if (SYMBOL_CONFIG[baseSymbol].isJoker) {
        let found = false;
        for (const [dRow, dCol] of ALL_DIRECTIONS) {
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
        if (!found) {
          baseSymbol = '🃏';
        }
      }
      
      // 找连通分量
      const { component, groupJokerCount } = findConnectedComponent(
        matrix, col, row, visited, baseSymbol
      );
      
      const connectedCount = component.length;
      
      // 只处理从左边列开始的连通分量
      if (connectedCount >= 3 && isFromLeftEdge(component)) {
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
        
        // 按从左到右排序
        const groupCells = component
          .map(c => ({ col: c.col, row: c.row }))
          .sort((a, b) => {
            if (a.col !== b.col) return a.col - b.col;
            return a.row - b.row;
          });
        
        winningGroups.push({
          symbol: baseSymbol,
          consecutiveCount: connectedCount,
          groupJokerCount,
          multiplier,
          winAmount,
          cells: groupCells
        });
        
        winDetails.push(`从左连接 ${baseSymbol}×${connectedCount}${groupJokerCount > 0 ? '+🃏×' + groupJokerCount : ''}: ${winAmount}`);
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

// 应用奖励
export function applyWin(totalWin) {
  if (totalWin > 0) {
    gameState.balance += totalWin;
  }
}
