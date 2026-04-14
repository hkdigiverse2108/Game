// ==================== DOM Elements ====================
const loadingScreen = document.getElementById('loadingScreen');
const settingsScreen = document.getElementById('settingsScreen');
const gameScreen = document.getElementById('gameScreen');
const resultModal = document.getElementById('resultModal');
const pauseModal = document.getElementById('pauseModal');
const statsModal = document.getElementById('statsModal');
const toast = document.getElementById('toastNotification');

// Settings elements
const modePVP = document.getElementById('modePVP');
const modePVC = document.getElementById('modePVC');
const player1NameInput = document.getElementById('player1Name');
const player2NameInput = document.getElementById('player2Name');
const player2Group = document.getElementById('player2Group');
const difficultyGroup = document.getElementById('difficultyGroup');
const diffOptions = document.querySelectorAll('.diff-card');
const themeOptions = document.querySelectorAll('.theme-option');
const startGameBtn = document.getElementById('startGameBtn');

// Game UI
const p1NameSpan = document.getElementById('p1Name');
const p2NameSpan = document.getElementById('p2Name');
const p1ScoreSpan = document.getElementById('p1Score');
const p2ScoreSpan = document.getElementById('p2Score');
const turnTextSpan = document.getElementById('turnText');
const gameBoard = document.getElementById('gameBoard');
const quickResetBtn = document.getElementById('quickResetBtn');
const quickNewGameBtn = document.getElementById('quickNewGameBtn');
const settingsNavBtn = document.getElementById('settingsNavBtn');
const pauseNavBtn = document.getElementById('pauseNavBtn');
const statsBtn = document.getElementById('statsBtn');
const closeStatsBtn = document.getElementById('closeStatsBtn');
const p2Icon = document.getElementById('p2Icon');

// Modal buttons
const resumeGameBtn = document.getElementById('resumeGameBtn');
const restartGameBtn = document.getElementById('restartGameBtn');
const newGameModalBtn = document.getElementById('newGameModalBtn');
const settingsModalBtn = document.getElementById('settingsModalBtn');
const resultNewGameBtn = document.getElementById('resultNewGameBtn');
const resultRematchBtn = document.getElementById('resultRematchBtn');
const resultCloseBtn = document.getElementById('resultCloseBtn');

// Result elements
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');

// Stats elements
const totalRoundsSpan = document.getElementById('totalRounds');
const statXWinsSpan = document.getElementById('statXWins');
const statOWinsSpan = document.getElementById('statOWins');
const statDrawsSpan = document.getElementById('statDraws');

// ==================== Audio ====================
const moveSound = new Audio('audio/move.wav');
const winSound = new Audio('audio/win.wav');
const drawSound = new Audio('audio/draw.wav');

function playSound(audioEl) {
  if (!audioEl) return;
  try {
    audioEl.currentTime = 0;
    const playPromise = audioEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  } catch (err) {
    // Ignore autoplay or playback errors
  }
}

// ==================== Game State ====================
let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp';
let difficulty = 'medium';
let currentTheme = 'light';
let playerNames = { X: 'DRAGON', O: 'PHOENIX' };
let scores = { X: 0, O: 0 };
let stats = {
  totalRounds: 0,
  xWins: 0,
  oWins: 0,
  draws: 0
};

const winPatterns = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// ==================== Particle Background ====================
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    const size = Math.random() * 6 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 15}s`;
    particle.style.animationDuration = `${10 + Math.random() * 10}s`;
    particlesContainer.appendChild(particle);
  }
}

// ==================== Theme Management ====================
function setTheme(theme) {
  currentTheme = theme;
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  localStorage.setItem('theme', theme);
  
  themeOptions.forEach(opt => {
    if (opt.getAttribute('data-theme') === theme) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  }
}

// ==================== Toast Notification ====================
function showToast(message, isError = false) {
  const toastMsg = document.getElementById('toastMessage');
  const toastIcon = toast.querySelector('i');
  toastMsg.textContent = message;
  
  if (isError) {
    toastIcon.className = 'fas fa-exclamation-circle';
    toastIcon.style.color = '#ef4444';
  } else {
    toastIcon.className = 'fas fa-check-circle';
    toastIcon.style.color = '#10b981';
  }
  
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// ==================== UI Updates ====================
function updateUINames() {
  p1NameSpan.textContent = playerNames.X;
  p2NameSpan.textContent = playerNames.O;
  
  if (gameMode === 'pvc') {
    p2Icon.className = 'fas fa-microchip';
  } else {
    p2Icon.className = 'far fa-circle';
  }
  updateTurnDisplay();
}

function updateScoresUI() {
  // Live header score should mirror match statistics (X/O wins)
  p1ScoreSpan.textContent = stats.xWins;
  p2ScoreSpan.textContent = stats.oWins;
}

function updateStatsUI() {
  totalRoundsSpan.textContent = stats.totalRounds;
  statXWinsSpan.textContent = stats.xWins;
  statOWinsSpan.textContent = stats.oWins;
  statDrawsSpan.textContent = stats.draws;
}

function updateTurnDisplay() {
  if (!gameActive) return;
  const currentName = currentPlayer === 'X' ? playerNames.X : playerNames.O;
  turnTextSpan.textContent = `${currentName}'s Turn`;
}

function clearWinHighlights() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('win-highlight');
  });
}

function renderBoard() {
  const cells = document.querySelectorAll('.cell');
  for (let i = 0; i < cells.length; i++) {
    cells[i].textContent = board[i];
    if (board[i] === 'X') {
      cells[i].classList.add('x-move');
      cells[i].classList.remove('o-move');
    } else if (board[i] === 'O') {
      cells[i].classList.add('o-move');
      cells[i].classList.remove('x-move');
    } else {
      cells[i].classList.remove('x-move', 'o-move');
    }
  }
}

// ==================== Result Modal ====================
function showResultModal(winner) {
  if (winner === 'draw') {
    resultIcon.innerHTML = '<i class="fas fa-handshake"></i>';
    resultTitle.textContent = 'Game Draw!';
    resultMessage.textContent = `${playerNames.X} and ${playerNames.O} showed great skill!`;
    resultIcon.querySelector('i').style.color = '#f59e0b';
    playSound(drawSound);
    stats.draws++;
  } else {
    resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
    resultTitle.textContent = `${playerNames[winner]} Wins!`;
    resultMessage.textContent = `${playerNames[winner]} dominates the arena! 🎯`;
    resultIcon.querySelector('i').style.color = '#f59e0b';
    playSound(winSound);
    
    if (winner === 'X') {
      stats.xWins++;
    } else {
      stats.oWins++;
    }
  }
  
  stats.totalRounds++;
  updateStatsUI();
  updateScoresUI();
  resultModal.classList.add('active');
}

function highlightWinningCombo(combo) {
  combo.forEach(index => {
    const cell = document.querySelector(`.cell[data-index='${index}']`);
    if (cell) cell.classList.add('win-highlight');
  });
}

// ==================== Game Logic ====================
function checkGameStatus() {
  for (let pattern of winPatterns) {
    const [a,b,c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameActive = false;
      const winner = board[a];
      scores[winner]++;
      updateScoresUI();
      highlightWinningCombo(pattern);
      showResultModal(winner);
      return true;
    }
  }
  
  if (!board.includes('')) {
    gameActive = false;
    showResultModal('draw');
    return true;
  }
  return false;
}

function makeMove(index) {
  if (!gameActive || board[index] !== '') return false;
  
  board[index] = currentPlayer;
  renderBoard();
  playSound(moveSound);
  
  // Play move sound effect (optional - using vibration for mobile)
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(50);
  }
  
  const gameEnded = checkGameStatus();
  if (gameEnded) return true;
  
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateTurnDisplay();
  return true;
}

function resetBoardGame(keepScores = false) {
  board.fill('');
  gameActive = true;
  currentPlayer = 'X';
  clearWinHighlights();
  renderBoard();
  updateTurnDisplay();
  
  if (!keepScores) {
    scores = { X: 0, O: 0 };
    updateScoresUI();
  }
}

function startNewGame(resetScores = true) {
  resetBoardGame(!resetScores);
  if (resetScores) {
    scores = { X: 0, O: 0 };
    updateScoresUI();
  }
  gameActive = true;
  currentPlayer = 'X';
  updateTurnDisplay();
  clearWinHighlights();
  renderBoard();
  
  if (gameMode === 'pvc' && currentPlayer === 'O') {
    setTimeout(() => computerMove(), 300);
  }
}

function resetStats() {
  stats = {
    totalRounds: 0,
    xWins: 0,
    oWins: 0,
    draws: 0
  };
  updateStatsUI();
  updateScoresUI();
}

// ==================== AI Logic ====================
function getEmptyIndices() {
  return board.reduce((arr, cell, idx) => cell === '' ? [...arr, idx] : arr, []);
}

function minimax(newBoard, depth, isMaximizing) {
  let winner = null;
  for (let pattern of winPatterns) {
    const [a,b,c] = pattern;
    if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
      winner = newBoard[a];
      break;
    }
  }
  
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (!newBoard.includes('')) return 0;
  
  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = 'O';
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = '';
        best = Math.max(score, best);
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = 'X';
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = '';
        best = Math.min(score, best);
      }
    }
    return best;
  }
}

function getBestMove() {
  if (difficulty === 'easy') {
    const empty = getEmptyIndices();
    if (empty.length) return empty[Math.floor(Math.random() * empty.length)];
  }
  
  if (difficulty === 'medium') {
    if (Math.random() < 0.4) {
      const empty = getEmptyIndices();
      if (empty.length) return empty[Math.floor(Math.random() * empty.length)];
    }
  }
  
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove !== -1 ? bestMove : getEmptyIndices()[0];
}

async function computerMove() {
  if (!gameActive || gameMode !== 'pvc' || currentPlayer !== 'O') return;
  await new Promise(resolve => setTimeout(resolve, 200));
  if (!gameActive || currentPlayer !== 'O') return;
  const moveIndex = getBestMove();
  if (moveIndex !== undefined && board[moveIndex] === '') {
    makeMove(moveIndex);
  }
}

// ==================== Cell Click Handler ====================
function handleCellClick(index) {
  if (!gameActive) return;
  if (gameMode === 'pvc' && currentPlayer === 'O') return;
  
  const moveMade = makeMove(index);
  if (moveMade && gameMode === 'pvc' && gameActive && currentPlayer === 'O') {
    computerMove();
  }
}

// ==================== Build Game Board ====================
function buildGameBoard() {
  gameBoard.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('data-index', i);
    cell.addEventListener('click', () => handleCellClick(i));
    cell.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleCellClick(i);
    });
    gameBoard.appendChild(cell);
  }
  renderBoard();
}

// ==================== Settings & Mode Management ====================
function setPageScrollMode(isSettings) {
  document.body.classList.toggle('settings-scroll', isSettings);
}

function setGameMode(mode) {
  gameMode = mode;
  if (mode === 'pvc') {
    player2Group.classList.add('hidden');
    difficultyGroup.classList.remove('hidden');
    playerNames.O = 'COMPUTER';
  } else {
    player2Group.classList.remove('hidden');
    difficultyGroup.classList.add('hidden');
    playerNames.O = player2NameInput.value.trim() || 'PHOENIX';
  }
  updateUINames();
}

function applySettingsAndStart() {
  playerNames.X = player1NameInput.value.trim() || 'DRAGON';
  if (gameMode === 'pvc') {
    playerNames.O = 'COMPUTER';
  } else {
    playerNames.O = player2NameInput.value.trim() || 'PHOENIX';
  }
  updateUINames();
  resetStats();
  startNewGame(true);
  settingsScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  setPageScrollMode(false);
  showToast('Game started! Good luck!');
}

// Difficulty selection
diffOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    diffOptions.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    difficulty = btn.getAttribute('data-diff');
    showToast(`Difficulty set to ${difficulty.toUpperCase()}`);
  });
});

// Theme selection
themeOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.getAttribute('data-theme');
    setTheme(theme);
    showToast(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme activated`);
  });
});

// Mode selection
modePVP.addEventListener('click', () => {
  modePVP.classList.add('active');
  modePVC.classList.remove('active');
  setGameMode('pvp');
  showToast('2 Player Mode selected');
});

modePVC.addEventListener('click', () => {
  modePVC.classList.add('active');
  modePVP.classList.remove('active');
  setGameMode('pvc');
  showToast('VS Computer Mode selected');
});

startGameBtn.addEventListener('click', applySettingsAndStart);

// ==================== Modal Controls ====================
function closeAllModals() {
  resultModal.classList.remove('active');
  pauseModal.classList.remove('active');
  statsModal.classList.remove('active');
}

settingsNavBtn.addEventListener('click', () => {
  gameScreen.classList.add('hidden');
  settingsScreen.classList.remove('hidden');
  setPageScrollMode(true);
  closeAllModals();
  showToast('Returning to settings');
});

pauseNavBtn.addEventListener('click', () => {
  pauseModal.classList.add('active');
});

statsBtn.addEventListener('click', () => {
  updateStatsUI();
  statsModal.classList.add('active');
});

closeStatsBtn.addEventListener('click', () => {
  statsModal.classList.remove('active');
});

resumeGameBtn.addEventListener('click', () => {
  pauseModal.classList.remove('active');
});

restartGameBtn.addEventListener('click', () => {
  resetBoardGame(false);
  if (gameMode === 'pvc' && currentPlayer === 'O') computerMove();
  pauseModal.classList.remove('active');
  showToast('Game restarted');
});

newGameModalBtn.addEventListener('click', () => {
  startNewGame(true);
  pauseModal.classList.remove('active');
  showToast('New game started');
});

settingsModalBtn.addEventListener('click', () => {
  gameScreen.classList.add('hidden');
  settingsScreen.classList.remove('hidden');
  setPageScrollMode(true);
  pauseModal.classList.remove('active');
});

quickResetBtn.addEventListener('click', () => {
  resetBoardGame(false);
  if (gameMode === 'pvc' && currentPlayer === 'O') computerMove();
  showToast('Round restarted');
});

quickNewGameBtn.addEventListener('click', () => {
  startNewGame(true);
  showToast('New match started');
});

resultNewGameBtn.addEventListener('click', () => {
  closeAllModals();
  startNewGame(true);
});

resultRematchBtn.addEventListener('click', () => {
  closeAllModals();
  resetBoardGame(false);
  if (gameMode === 'pvc' && currentPlayer === 'O') computerMove();
});

// ==================== Keyboard Controls ====================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (resultModal.classList.contains('active')) {
      closeAllModals();
    } else if (pauseModal.classList.contains('active')) {
      pauseModal.classList.remove('active');
    } else if (statsModal.classList.contains('active')) {
      statsModal.classList.remove('active');
    } else if (!gameScreen.classList.contains('hidden') && gameActive) {
      pauseModal.classList.add('active');
    }
  }
});

// ==================== Initialize Application ====================
function init() {
  createParticles();
  buildGameBoard();
  loadSavedTheme();
  setGameMode('pvp');
  updateUINames();
  
  // Loading screen transition
setTimeout(() => {
  loadingScreen.classList.add('fade-out');
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    settingsScreen.classList.remove('hidden');
    setPageScrollMode(true);
    showToast('Welcome to Premier Tic Tac Toe!');
  }, 500);
}, 2200);
}

// Start the application
init();
