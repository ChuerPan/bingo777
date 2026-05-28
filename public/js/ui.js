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

// 显示浮动文本（奖励提示）- 修复版
export function showFloatingText(text, x, y, extraClass = '') {
  const container = document.getElementById('reelsContainer');
  const floatText = document.createElement('div');
  floatText.className = 'floating-text ' + extraClass;
  floatText.textContent = text;
  // 直接设置绝对位置，确保动画正确
  floatText.style.left = `${x}px`;
  floatText.style.top = `${y}px`;
  container.appendChild(floatText);
  
  setTimeout(() => {
    floatText.remove();
  }, 1500);
}

// 高亮中奖符号并显示奖励 - 逐组高亮并显示奖励总和
export function highlightWinningSymbols(winningGroups, allCrownCells, crownCount, crownMultiplier) {
  // 按组依次高亮
  let groupIndex = 0;
  
  return new Promise((resolve) => {
    function highlightGroup() {
      if (groupIndex >= winningGroups.length) {
        // 所有组高亮完成，现在处理皇冠
        let crownIndex = 0;
        function highlightNextCrown() {
          if (crownIndex < allCrownCells.length) {
            const cell = allCrownCells[crownIndex];
            setTimeout(() => {
              const reel = document.getElementById(`reel${cell.col}`);
              const symbols = reel.querySelectorAll('.symbol');
              const targetIndex = symbols.length - GAME_CONSTANTS.VISIBLE_ROWS + cell.row;
              const targetSymbol = symbols[targetIndex];
              
              if (targetSymbol) {
                targetSymbol.classList.add('highlight');
                
                const containerRect = document.getElementById('reelsContainer').getBoundingClientRect();
                const reelRect = reel.getBoundingClientRect();
                const x = reelRect.left - containerRect.left + reelRect.width / 2;
                const y = reelRect.top - containerRect.top + cell.row * 80;
                
                showFloatingText('👑', x, y, 'crown');
                
                setTimeout(() => {
                  targetSymbol.classList.remove('highlight');
                }, 1200);
              }
              
              crownIndex++;
              highlightNextCrown();
            }, 150);
          } else if (crownMultiplier > 1) {
            setTimeout(() => {
              const container = document.getElementById('reelsContainer');
              const x = container.offsetWidth / 2;
              const y = container.offsetHeight / 2;
              showFloatingText(`皇冠加成 ×${crownMultiplier}`, x, y, 'crown');
            }, 200);
            setTimeout(resolve, 3000);
          } else {
            setTimeout(resolve, 2000);
          }
        }
        
        highlightNextCrown();
        return;
      }
      
      const group = winningGroups[groupIndex];
      let cellIndex = 0;
      
      function highlightCell() {
        if (cellIndex >= group.cells.length) {
          // 该组所有符号高亮完成，停顿并显示奖励总和
          setTimeout(() => {
            // 在该组中间位置显示奖励总和
            const midCell = group.cells[Math.floor(group.cells.length / 2)];
            const reel = document.getElementById(`reel${midCell.col}`);
            const container = document.getElementById('reelsContainer');
            const containerRect = container.getBoundingClientRect();
            const reelRect = reel.getBoundingClientRect();
            const x = reelRect.left - containerRect.left + reelRect.width / 2;
            const y = reelRect.top - containerRect.top + midCell.row * 80;
            
            showFloatingText(`+${group.winAmount}`, x, y, 'group-total');
            
            // 停顿1.5秒后继续下一组
            setTimeout(() => {
              groupIndex++;
              highlightGroup();
            }, 1500);
          }, 300);
          return;
        }
        
        const cell = group.cells[cellIndex];
        const reel = document.getElementById(`reel${cell.col}`);
        const symbols = reel.querySelectorAll('.symbol');
        const targetIndex = symbols.length - GAME_CONSTANTS.VISIBLE_ROWS + cell.row;
        const targetSymbol = symbols[targetIndex];
        
        if (targetSymbol) {
          targetSymbol.classList.add('highlight');
          
          // 每个符号高亮时显示贡献的奖励
          const cellWin = Math.round(group.winAmount / group.cells.length);
          const container = document.getElementById('reelsContainer');
          const containerRect = container.getBoundingClientRect();
          const reelRect = reel.getBoundingClientRect();
          const x = reelRect.left - containerRect.left + reelRect.width / 2;
          const y = reelRect.top - containerRect.top + cell.row * 80;
          
          showFloatingText(`+${cellWin}`, x, y, '');
          
          // 高亮0.5秒后移除
          setTimeout(() => {
            targetSymbol.classList.remove('highlight');
          }, 500);
        }
        
        cellIndex++;
        
        // 每个符号间隔150ms
        setTimeout(highlightCell, 150);
      }
      
      highlightCell();
    }
    
    highlightGroup();
  });
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
