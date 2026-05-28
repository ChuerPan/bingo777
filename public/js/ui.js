// UI 和动画显示模块
import { SYMBOL_CONFIG, GAME_CONSTANTS, SYMBOLS } from './config.js';
import { gameState } from './gameState.js';

// 初始化符号奖励显示区域
export function initSymbolRewards() {
  const container = document.getElementById('symbolRewards');
  container.innerHTML = SYMBOLS.map(symbol => {
    const cfg = SYMBOL_CONFIG[symbol];
    const isCrown = symbol === '👑';
    const isJoker = symbol === '🃏';
    return `
      <div class="symbol-item${isCrown ? ' crown' : ''}${isJoker ? ' joker' : ''}">
        <div class="symbol-icon">${symbol}</div>
        <div class="symbol-name">${cfg.name}${isJoker ? ' (万能)' : ''}${isCrown ? ' (特效)' : ''}</div>
        <div style="font-size: 0.8rem; color: #aaa;">
          连3: ${cfg.consecutive3}x | 连4: ${cfg.consecutive4}x<br>
          连5: ${cfg.consecutive5}x | 连6: ${cfg.consecutive6}x</div>
      </div>
    `;
  }).join('');
}

// 更新余额显示
export function updateBalanceDisplay() {
  document.getElementById('balance').textContent = gameState.balance;
  document.getElementById('currentBet').textContent = gameState.currentBet;
  document.getElementById('betDisplay').textContent = gameState.currentBet;
}

// 显示结果
export function showResult(totalWin, winDetails) {
  const resultText = document.getElementById('resultText');
  const resultAmount = document.getElementById('resultAmount');
  
  if (totalWin > 0) {
    resultText.textContent = `🎉 恭喜中奖! ${winDetails.join(' | ')}`;
    resultAmount.textContent = `+${totalWin}`;
    resultAmount.className = 'result-amount win';
  } else {
    resultText.textContent = '😔 未中奖，再接再厉!';
    resultAmount.textContent = `-${gameState.currentBet}`;
    resultAmount.className = 'result-amount lose';
  }
}

// 简单直接的浮动文字显示函数
export function showFloatingText(text, x, y, extraClass = '') {
  const container = document.getElementById('reelsContainer');
  const floatText = document.createElement('div');
  floatText.className = 'floating-text ' + extraClass;
  floatText.textContent = text;
  floatText.style.position = 'absolute';
  floatText.style.left = x + 'px';
  floatText.style.top = y + 'px';
  floatText.style.transform = 'translate(-50%, -50%)';
  floatText.style.zIndex = '300';
  container.appendChild(floatText);
  
  // 动画结束后移除
  setTimeout(() => {
    if (floatText.parentNode) {
      floatText.parentNode.removeChild(floatText);
    }
  }, 1500);
}

// 在指定位置创建浮动文字
function createFloatAtPosition(text, col, row, extraClass = '') {
  const reel = document.getElementById(`reel${col}`);
  if (!reel) return;
  
  const symbols = reel.querySelectorAll('.symbol');
  const targetIndex = symbols.length - GAME_CONSTANTS.VISIBLE_ROWS + row;
  const targetSymbol = symbols[targetIndex];
  
  if (!targetSymbol) return;
  
  // 获取目标元素的位置
  const targetRect = targetSymbol.getBoundingClientRect();
  const container = document.getElementById('reelsContainer');
  const containerRect = container.getBoundingClientRect();
  
  const x = targetRect.left - containerRect.left + targetRect.width / 2;
  const y = targetRect.top - containerRect.top + targetRect.height / 2;
  
  showFloatingText(text, x, y, extraClass);
}

// 高亮中奖符号并显示奖励 - 逐组高亮
export function highlightWinningSymbols(winningGroups, allCrownCells, crownCount, crownMultiplier) {
  return new Promise((resolve) => {
    // 如果没有中奖组合，直接结束
    if (winningGroups.length === 0 && allCrownCells.length === 0) {
      setTimeout(resolve, 500);
      return;
    }
    
    let groupIdx = 0;
    let isProcessingCrown = false;
    
    function processGroup() {
      if (groupIdx >= winningGroups.length) {
        // 开始处理皇冠
        isProcessingCrown = true;
        processCrown();
        return;
      }
      
      const group = winningGroups[groupIdx];
      let cellIdx = 0;
      
      function highlightCell() {
        if (cellIdx >= group.cells.length) {
          // 该组高亮完成，停顿并显示奖励总和
          setTimeout(() => {
            // 显示该组奖励总和
            const midCell = group.cells[Math.floor(group.cells.length / 2)];
            createFloatAtPosition(`+${group.winAmount}`, midCell.col, midCell.row, 'group-total');
            
            // 1.5秒后继续下一组
            setTimeout(() => {
              groupIdx++;
              processGroup();
            }, 1500);
          }, 200);
          return;
        }
        
        const cell = group.cells[cellIdx];
        
        // 高亮当前符号
        highlightSymbol(cell.col, cell.row, true);
        
        // 显示单个符号的奖励
        const cellReward = Math.round(group.winAmount / group.cells.length);
        setTimeout(() => {
          createFloatAtPosition(`+${cellReward}`, cell.col, cell.row, '');
        }, 50);
        
        cellIdx++;
        
        // 150ms后继续下一个符号
        setTimeout(highlightCell, 150);
      }
      
      highlightCell();
    }
    
    function processCrown() {
      if (!isProcessingCrown) return;
      
      if (allCrownCells.length === 0) {
        if (crownMultiplier > 1) {
          // 显示皇冠加成
          const container = document.getElementById('reelsContainer');
          const x = container.offsetWidth / 2;
          const y = container.offsetHeight / 2;
          showFloatingText(`皇冠加成 ×${crownMultiplier}`, x, y, 'crown');
        }
        setTimeout(resolve, crownMultiplier > 1 ? 3000 : 2000);
        return;
      }
      
      const cell = allCrownCells.shift();
      
      // 高亮皇冠
      highlightSymbol(cell.col, cell.row, true);
      createFloatAtPosition('👑', cell.col, cell.row, 'crown');
      
      setTimeout(processCrown, 200);
    }
    
    processGroup();
  });
}

// 高亮/取消高亮指定位置的符号
function highlightSymbol(col, row, highlight) {
  const reel = document.getElementById(`reel${col}`);
  if (!reel) return;
  
  const symbols = reel.querySelectorAll('.symbol');
  const targetIndex = symbols.length - GAME_CONSTANTS.VISIBLE_ROWS + row;
  const targetSymbol = symbols[targetIndex];
  
  if (!targetSymbol) return;
  
  if (highlight) {
    targetSymbol.classList.add('highlight');
  } else {
    targetSymbol.classList.remove('highlight');
  }
}

// 禁用/启用控制按钮
export function toggleControls(enabled) {
  document.getElementById('spinBtn').disabled = !enabled;
  document.getElementById('betMinus').disabled = !enabled;
  document.getElementById('betPlus').disabled = !enabled;
}

// 应用配置并显示提示
export function showConfigApplied(config) {
  document.getElementById('summaryRtp').textContent = `${config.rtp}%`;
  document.getElementById('summaryVol').textContent = config.volatility;
  document.getElementById('summaryHouseEdge').textContent = `${config.houseEdge}%`;
  
  const summary = document.getElementById('configSummary');
  summary.classList.add('show');
  setTimeout(() => summary.classList.remove('show'), 3000);
}
