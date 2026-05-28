// 游戏状态管理模块
import { GAME_CONSTANTS, gameConfig } from './config.js';

// 游戏状态
export let gameState = {
  balance: GAME_CONSTANTS.INITIAL_BALANCE,
  currentBet: GAME_CONSTANTS.MIN_BET,
  isSpinning: false,
  config: { ...gameConfig }
};

// 更新状态方法
export function updateBalance(newBalance) {
  gameState.balance = newBalance;
}

export function updateBet(newBet) {
  gameState.currentBet = newBet;
}

export function setSpinning(spinning) {
  gameState.isSpinning = spinning;
}

export function updateConfig(newConfig) {
  gameState.config = { ...gameState.config, ...newConfig };
}

// 重置游戏状态
export function resetGameState() {
  gameState.balance = GAME_CONSTANTS.INITIAL_BALANCE;
  gameState.currentBet = GAME_CONSTANTS.MIN_BET;
  gameState.isSpinning = false;
}
