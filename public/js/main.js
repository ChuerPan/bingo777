// 主游戏入口模块
import { GAME_CONSTANTS } from './config.js';
import { gameState, updateBalance, updateBet, setSpinning, updateConfig } from './gameState.js';
import { initReels, animateReel } from './reels.js';
import { analyzeWinningMatrix, applyWin } from './winCheck.js';
import { 
  initSymbolRewards, 
  updateBalanceDisplay, 
  showResult, 
  highlightWinningSymbols, 
  toggleControls, 
  showConfigApplied 
} from './ui.js';

// 游戏主流程 - 开始游戏
export async function spinReels() {
  if (gameState.isSpinning || gameState.balance < gameState.currentBet) {
    return;
  }
  
  // 开始游戏
  setSpinning(true);
  toggleControls(false);
  gameState.balance -= gameState.currentBet;
  updateBalanceDisplay();
  
  // 清除之前的高亮
  document.querySelectorAll('.symbol.highlight').forEach(el => el.classList.remove('highlight'));
  
  // 等待所有轮盘停止
  const resultMatrix = [];
  await new Promise((resolve) => {
    let delay = 0;
    let completedReels = 0;
    
    for (let col = 0; col < GAME_CONSTANTS.REEL_COUNT; col++) {
      setTimeout(() => {
        animateReel(col, (columnSymbols) => {
          resultMatrix[col] = columnSymbols;
          completedReels++;
          if (completedReels === GAME_CONSTANTS.REEL_COUNT) {
            setTimeout(resolve, 300);
          }
        });
      }, delay);
      delay += 400;
    }
  });
  
  // 分析奖励
  const winResult = analyzeWinningMatrix(resultMatrix);
  
  // 应用奖励
  applyWin(winResult.totalWin);
  
  // 显示结果
  showResult(winResult.totalWin, winResult.winDetails);
  updateBalanceDisplay();
  
  // 高亮显示中奖符号
  if (winResult.totalWin > 0) {
    await highlightWinningSymbols(
      winResult.winningGroups, 
      winResult.allCrownCells, 
      winResult.crownCount, 
      winResult.crownMultiplier
    );
  }
  
  // 游戏结束，恢复状态
  setSpinning(false);
  toggleControls(true);
}

// 调整投注金额
export function adjustBet(delta) {
  const newBet = gameState.currentBet + delta;
  if (newBet >= GAME_CONSTANTS.MIN_BET && newBet <= GAME_CONSTANTS.MAX_BET) {
    updateBet(newBet);
    updateBalanceDisplay();
  }
}

// 应用配置
export function applyConfig() {
  const rtp = parseFloat(document.getElementById('rtp').value);
  const volatility = parseFloat(document.getElementById('volatility').value);
  const houseEdge = parseFloat(document.getElementById('houseEdge').value);
  
  updateConfig({
    rtp,
    volatility,
    houseEdge
  });
  
  document.getElementById('houseEdge').value = (100 - rtp).toFixed(1);
  showConfigApplied(gameState.config);
}

// RTP输入变化时自动更新庄家优势
export function onRtpChange(event) {
  const rtp = parseFloat(event.target.value);
  document.getElementById('houseEdge').value = (100 - rtp).toFixed(1);
}

// 庄家优势输入变化时自动更新RTP
export function onHouseEdgeChange(event) {
  const houseEdge = parseFloat(event.target.value);
  document.getElementById('rtp').value = (100 - houseEdge).toFixed(1);
}

// 初始化游戏
export function initGame() {
  initSymbolRewards();
  initReels();
  updateBalanceDisplay();
  
  // 绑定事件
  document.getElementById('betMinus').addEventListener('click', () => adjustBet(-GAME_CONSTANTS.BET_STEP));
  document.getElementById('betPlus').addEventListener('click', () => adjustBet(GAME_CONSTANTS.BET_STEP));
  document.getElementById('spinBtn').addEventListener('click', spinReels);
  document.getElementById('applyBtn').addEventListener('click', applyConfig);
  document.getElementById('rtp').addEventListener('input', onRtpChange);
  document.getElementById('houseEdge').addEventListener('input', onHouseEdgeChange);
}

// 页面加载完成后初始化游戏
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
