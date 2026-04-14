const app = document.getElementById('app');

const PREVIEW_RESULT = false;

const PLAYER_THEME = {
  red: { main: '#DC2626', light: '#FCA5A5', dark: '#7F1D1D', glow: 'rgba(239,68,68,0.6)' },
  green: { main: '#16A34A', light: '#86EFAC', dark: '#14532D', glow: 'rgba(34,197,94,0.6)' },
  yellow: { main: '#CA8A04', light: '#FDE68A', dark: '#713F12', glow: 'rgba(234,179,8,0.6)' },
  blue: { main: '#2563EB', light: '#93C5FD', dark: '#1E3A8A', glow: 'rgba(59,130,246,0.6)' },
};

const TOKEN_IMAGES = {
  red: 'images/token%20red.png',
  green: 'images/token%20green.png',
  yellow: 'images/token%20yellow.png',
  blue: 'images/token%20blue.png',
};

const STAR_IMAGE = 'images/Star%20Safe%20Icon.png';

const ALL_COLORS = ['red', 'green', 'yellow', 'blue'];
const COLOR_ASSIGN = ['blue', 'red', 'green', 'yellow'];

const MAIN_PATH = [
  [6,1],[6,2],[6,3],[6,4],[6,5],
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
  [0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  [7,14],[8,14],
  [8,13],[8,12],[8,11],[8,10],[8,9],
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],[14,6],
  [13,6],[12,6],[11,6],[10,6],[9,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  [7,0],[6,0],
];

const PATH_LENGTH = 52;
const HOME_STEPS = 6; // includes center
const HOME_LANE_STEPS = HOME_STEPS - 1;
const TOTAL_PROGRESS = PATH_LENGTH + HOME_LANE_STEPS;

const PLAYER_START = { red: 0, green: 13, yellow: 26, blue: 39 };

const HOME_ENTRY_INDEX = {
  red: 50,
  green: 11,
  yellow: 24,
  blue: 37,
};

const HOME_COLUMNS = {
  red: [[7,1],[7,2],[7,3],[7,4],[7,5]],
  green: [[1,7],[2,7],[3,7],[4,7],[5,7]],
  yellow: [[7,13],[7,12],[7,11],[7,10],[7,9]],
  blue: [[13,7],[12,7],[11,7],[10,7],[9,7]],
};

const HOME_BASE_SLOTS = {
  red: [[1.45,1.45],[1.45,3.55],[3.55,1.45],[3.55,3.55]],
  green: [[1.45,10.45],[1.45,12.55],[3.55,10.45],[3.55,12.55]],
  yellow: [[10.45,10.45],[10.45,12.55],[12.55,10.45],[12.55,12.55]],
  blue: [[10.45,1.45],[10.45,3.55],[12.55,1.45],[12.55,3.55]],
};

const DEFAULT_HOME_OFFSETS = { red: { top: 0, left: 0 }, green: { top: 0, left: 9 }, yellow: { top: 9, left: 9 }, blue: { top: 9, left: 0 } };

function getHomeOffsetForColor(color, state) {
  if (!state || !state.players) return DEFAULT_HOME_OFFSETS[color];
  const activeColors = state.players.map((p) => p.color);
  if (activeColors.length === 2) {
    const first = activeColors[0];
    const second = activeColors[1];
    if (color === first) return { top: 0, left: 0 };
    if (color === second) return { top: 9, left: 9 };
    const inactive = ALL_COLORS.filter((c) => !activeColors.includes(c));
    const slots = [{ top: 0, left: 9 }, { top: 9, left: 0 }];
    const idx = inactive.indexOf(color);
    if (idx >= 0) return slots[idx] || DEFAULT_HOME_OFFSETS[color];
  }
  return DEFAULT_HOME_OFFSETS[color];
}

function getHomeBaseSlotsForColor(color, state) {
  const offset = getHomeOffsetForColor(color, state);
  if (!offset) return HOME_BASE_SLOTS[color];
  const top = offset.top;
  const left = offset.left;
  return [
    [top + 1.45, left + 1.45],
    [top + 1.45, left + 3.55],
    [top + 3.55, left + 1.45],
    [top + 3.55, left + 3.55],
  ];
}

const SAFE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const SAFE_CELLS = new Map();
[0, 13, 26, 39].forEach((i) => {
  const colors = ['red', 'green', 'yellow', 'blue'];
  SAFE_CELLS.set(`${MAIN_PATH[i][0]},${MAIN_PATH[i][1]}`, colors[Math.floor(i / 13)]);
});
[8, 21, 34, 47].forEach((i) => {
  SAFE_CELLS.set(`${MAIN_PATH[i][0]},${MAIN_PATH[i][1]}`, 'star');
});

const SOUND_FILES = {
  click: 'audio/click.mp3',
  dice: 'audio/dice rolling.mp3',
  move: 'audio/Token Move.mp3',
  kill: 'audio/kill.mp3',
  result: 'audio/result.mp3',
  win: 'audio/win.mp3',
};

const MODES = [
  { id: 'ai', label: 'vs AI', desc: 'Play against smart bot', icon: 'bot', players: 2, ai: 1 },
  { id: '2p', label: '2 Players', desc: 'Head to head', icon: 'users', players: 2, ai: 0 },
  { id: '3p', label: '3 Players', desc: 'Triple threat', icon: 'users', players: 3, ai: 0 },
  { id: '4p', label: '4 Players', desc: 'Full house', icon: 'crown', players: 4, ai: 0 },
];

const STATE = {
  screen: 'loading',
  selectedMode: null,
  names: ['', '', '', ''],
  config: null,
  gameState: null,
  finalState: null,
  message: '',
  rolling: false,
  captureEffect: false,
  progress: 0,
  loadingTimer: null,
  aiTimer: null,
  advanceTimer: null,
  moveTimer: null,
  animating: false,
  animateTokens: new Map(),
  lastTokenPositions: new Map(),
  diceRotation: { x: 0, y: 0, z: 0 },
  diceFace: 1,
  diceSpin: { x: 720, y: 900, z: 360 },
  diceTarget: { x: 0, y: 0, z: 0 },
  exitPrompt: { open: false },
  soundOn: true,
};

function saveSession() {
  if (STATE.screen !== 'game' || !STATE.gameState) return;
  const stateCopy = { screen: STATE.screen, selectedMode: STATE.selectedMode, names: STATE.names, config: STATE.config, gameState: STATE.gameState };
  sessionStorage.setItem('ludoSave', JSON.stringify(stateCopy));
}

function loadSession() {
  try {
    const data = sessionStorage.getItem('ludoSave');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && parsed.gameState && !parsed.gameState.gameOver) {
        Object.assign(STATE, parsed);
        STATE.animateTokens = new Map();
        STATE.lastTokenPositions = new Map();
        return true;
      }
    }
  } catch (e) {}
  return false;
}

window.addEventListener('DOMContentLoaded', () => {
  const storedSound = localStorage.getItem('ludoSound');
  if (storedSound === 'off') STATE.soundOn = false;
  renderApp();
  startLoading();
});

function playSound(key, options = {}) {
  if (!STATE.soundOn) return;
  const src = SOUND_FILES[key];
  if (!src) return;
  const audio = new Audio(encodeURI(src));
  audio.volume = options.volume ?? 1;
  audio.playbackRate = options.rate ?? 1;
  const startAt = options.startAt ?? 0;
  try {
    audio.currentTime = startAt;
  } catch (e) {}
  audio.play().catch(() => {});
}

function playClickSound() {
  playSound('click', { volume: 0.55 });
}

function renderApp() {
  if (STATE.screen === 'loading') {
    renderLoadingScreen();
  } else if (STATE.screen === 'home') {
    renderHomeScreen();
  } else if (STATE.screen === 'game') {
    renderGameScreen();
  } else if (STATE.screen === 'result') {
    renderResultScreen();
  }
}

function renderIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function clearTimers() {
  if (STATE.loadingTimer) {
    clearInterval(STATE.loadingTimer);
    STATE.loadingTimer = null;
  }
  if (STATE.aiTimer) {
    clearTimeout(STATE.aiTimer);
    STATE.aiTimer = null;
  }
  if (STATE.advanceTimer) {
    clearTimeout(STATE.advanceTimer);
    STATE.advanceTimer = null;
  }
  if (STATE.moveTimer) {
    clearTimeout(STATE.moveTimer);
    STATE.moveTimer = null;
  }
}

function startLoading() {
  clearTimers();
  STATE.progress = 0;
  STATE.screen = 'loading';
  STATE.animating = false;
  STATE.animateTokens.clear();
  STATE.lastTokenPositions.clear();
  renderApp();
  STATE.loadingTimer = setInterval(() => {
    STATE.progress = Math.min(100, STATE.progress + 2);
    renderLoadingScreen();
    if (STATE.progress >= 100) {
      clearInterval(STATE.loadingTimer);
      STATE.loadingTimer = null;
      setTimeout(() => {
        if (loadSession()) {
          renderApp();
          scheduleAI();
        } else {
          goHome();
        }
      }, 400);
    }
  }, 40);
}

function renderLoadingScreen() {
  app.innerHTML = `
    <div class="fixed inset-0 bg-loading flex flex-col items-center justify-center p-8 z-50">
      <img src="images/Logo%20SVG.png" alt="Royal Ludo Logo" class="w-64 h-auto object-contain mb-8 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] animate-pulse" />

      <div class="w-full max-w-[240px] h-4 rounded-full progress-container overflow-hidden">
        <div class="h-full rounded-full progress-fill" style="width: ${STATE.progress}%;"></div>
      </div>
      <p class="text-muted-foreground text-xs tracking-[0.2em] uppercase mt-4 animate-pulse">Loading Premium Experience...</p>
    </div>
  `;
  renderIcons();
}

function goHome() {
  clearTimers();
  sessionStorage.removeItem('ludoSave');
  STATE.screen = 'home';
  STATE.selectedMode = null;
  STATE.names = ['', '', '', ''];
  STATE.config = null;
  STATE.finalState = null;
  STATE.message = '';









  renderApp();
}

function renderHomeScreen() {
  const mode = MODES.find((m) => m.id === STATE.selectedMode);
  const humanCount = mode ? mode.players - mode.ai : 0;
  const canPlay = Boolean(mode && STATE.names.slice(0, humanCount).every((n) => n.trim().length > 0));

  app.innerHTML = `
    <div class="fixed inset-0 bg-menu overflow-auto">
      <div class="min-h-full w-full max-w-5xl mx-auto px-5 py-8 sm:py-10 flex flex-col items-center gap-6">
        <div class="w-full flex flex-col items-center gap-3">
          <img src="images/Logo%20SVG.png" alt="Royal Ludo Logo" class="w-40 sm:w-44 h-auto object-contain filter drop-shadow-[0_10px_22px_rgba(15,23,42,0.25)]" />
          <div class="panel-glass w-full max-w-xl px-4 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-slate-700">
            <i data-lucide="swords" class="w-4 h-4 text-primary"></i> Select Mode
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
          ${MODES.map((m) => {
            const active = m.id === STATE.selectedMode;
            return `
              <button data-mode="${m.id}" class="selection-card p-4 rounded-2xl text-left flex flex-col items-start gap-2 ${active ? 'active' : ''}">
                <div class="p-2.5 rounded-xl chip-soft">
                  <i data-lucide="${m.icon}" class="w-5 h-5 ${active ? 'text-primary' : 'text-slate-500'}"></i>
                </div>
                <div class="font-bold text-sm text-slate-900">${m.label}</div>
                <div class="text-[10px] uppercase tracking-[0.25em] text-slate-500">${m.desc}</div>
              </button>
            `;
          }).join('')}
        </div>

        ${mode ? `
          <div class="w-full panel-light p-6 rounded-3xl animate-slide-up">
            <div class="flex items-center justify-between gap-3 mb-4">
              <p class="text-xs font-bold text-slate-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <i data-lucide="users" class="w-4 h-4 text-primary"></i> Player Setup
              </p>
              <div class="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Mode: ${mode.label}</div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${Array.from({ length: humanCount }).map((_, i) => `
                <div class="relative">
                  <i data-lucide="user" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                  <input
                    data-input-index="${i}"
                    type="text"
                    placeholder="Player ${i + 1} Name"
                    value="${escapeHtml(STATE.names[i] || '')}"
                    maxlength="12"
                    class="input-premium w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold"
                  />
                </div>
              `).join('')}
            </div>
            ${mode.ai > 0 ? `
              <div class="mt-4 px-4 py-3 rounded-xl chip-soft text-xs font-semibold flex items-center gap-3 text-slate-700">
                <i data-lucide="bot" class="w-5 h-5 text-primary"></i> <span class="uppercase tracking-wide">${mode.ai} AI Opponent(s)</span>
              </div>
            ` : ''}
            <div class="pt-5">
              <button id="start-button" ${canPlay ? '' : 'disabled'} class="w-full py-4 rounded-2xl font-black text-[13px] uppercase tracking-[0.3em] transition-all duration-300 ${canPlay ? 'btn-premium text-white' : 'bg-secondary text-slate-400 cursor-not-allowed opacity-70'}">
                <i data-lucide="play" class="w-4 h-4 inline-block -mt-1 mr-2"></i> Start Match
              </button>
            </div>
          </div>
        ` : '<div class="h-6"></div>'}
      </div>
    </div>
  `;

  renderIcons();

  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      playClickSound();
      const modeId = button.dataset.mode;
      if (!modeId) return;
      STATE.selectedMode = modeId;
      STATE.names = ['', '', '', ''];
      renderHomeScreen();
    });
  });

  document.querySelectorAll('input[data-input-index]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      const index = Number(target.dataset.inputIndex);
      STATE.names[index] = target.value;
      updateStartButton();
    });
  });

  const startButton = document.getElementById('start-button');
  if (startButton) {
    startButton.addEventListener('click', () => {
      playClickSound();
      const selected = MODES.find((item) => item.id === STATE.selectedMode);
      if (!selected) return;
      const names = [];
      const humans = selected.players - selected.ai;
      for (let i = 0; i < selected.players; i += 1) {
        if (i < humans) names.push(STATE.names[i].trim());
        else names.push('Bot');
      }
      const config = {
        mode: selected.id,
        playerCount: selected.players,
        playerNames: names,
        aiCount: selected.ai,
      };
      sessionStorage.setItem('ludoConfig', JSON.stringify(config));
      startGame(config);
    });
  }
}

function updateStartButton() {
  const mode = MODES.find((m) => m.id === STATE.selectedMode);
  if (!mode) return;
  const humanCount = mode.players - mode.ai;
  const canPlay = STATE.names.slice(0, humanCount).every((n) => n.trim().length > 0);
  const startButton = document.getElementById('start-button');
  if (!startButton) return;
  startButton.disabled = !canPlay;
  startButton.className = `w-full py-4 rounded-xl font-black text-[13px] uppercase tracking-widest transition-all duration-300 ${canPlay ? 'btn-premium text-white' : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-60'}`;
}

function getStartButtonClasses(enabled) {
  return `w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider ${enabled ? 'btn-premium text-white' : 'bg-secondary text-muted-foreground cursor-not-allowed'}`;
}

function getStartButtonStyle(enabled) {
  return '';
}

function startGame(config) {
  clearTimers();
  STATE.config = config;
  const colorAssign = config.playerCount === 2 ? ['red', 'yellow'] : COLOR_ASSIGN;
  const players = [];
  for (let i = 0; i < config.playerCount; i += 1) {
    players.push({
      color: colorAssign[i],
      name: config.playerNames[i],
      isAI: i >= config.playerCount - config.aiCount,
    });
  }
  STATE.gameState = createGame(players);
  STATE.screen = 'game';
  STATE.message = '';
  STATE.rolling = false;
  STATE.captureEffect = false;
  STATE.animating = false;
  STATE.animateTokens.clear();
  STATE.lastTokenPositions.clear();
  STATE.diceRotation = { x: 0, y: 0, z: 0 };
  STATE.diceFace = 1;
  STATE.diceSpin = { x: 720, y: 900, z: 360 };
  STATE.diceTarget = { x: 0, y: 0, z: 0 };
  renderApp();
}

function renderGameScreen() {
  saveSession();
  if (!STATE.gameState || !STATE.config) {
    goHome();
    return;
  }

  if (PREVIEW_RESULT) {
    STATE.finalState = {
      ...STATE.gameState,
      players: STATE.gameState.players.map((p, i) => ({ ...p, finishOrder: i + 1 })),
    };
    STATE.screen = 'result';
    renderResultScreen();
    return;
  }

  const gameState = STATE.gameState;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const theme = PLAYER_THEME[currentPlayer.color];

  const isVsAI = STATE.config.aiCount > 0;
  const canChooseLeave = !isVsAI && gameState.players.length > 1;

  app.innerHTML = `
    <div class="fixed inset-0 bg-transparent game-shell">
      ${STATE.captureEffect ? `<div class="fixed inset-0 z-50 pointer-events-none animate-fade-in" style="background-color: rgba(220,38,38,0.2);"></div>` : ''}

      <div class="game-navbar">
        <button id="home-button" class="nav-btn nav-exit" >
          <i class="fas fa-sign-out-alt"></i>
        </button>

        <div class="turn-bar">
          <span class="turn-ring" style="border-color:${theme.main}; box-shadow: 0 0 12px ${theme.glow};">
            <img src="${TOKEN_IMAGES[currentPlayer.color]}" alt="" class="turn-token" />
          </span>
          <span class="turn-title">Turn</span>
          <span class="turn-current" style="color:${theme.main};">Now</span>
        </div>

        <button id="sound-button" class="nav-btn nav-sound" aria-label="Sound">
          <i data-lucide="${STATE.soundOn ? 'volume-2' : 'volume-x'}" class="w-4 h-4"></i>
        </button>
      </div>

      <div class="game-body">
        ${renderBoard(gameState, gameState.validMoves)}
      </div>

      <div class="game-footer">
        <div class="game-hint ${STATE.message || (gameState.phase === 'waiting' && !currentPlayer.isAI) ? 'show' : ''}">
          ${STATE.message ? escapeHtml(STATE.message) : (gameState.phase === 'waiting' && !currentPlayer.isAI ? 'Tap dice to roll' : '&nbsp;')}
        </div>
        <div class="dice-area">
          ${renderDice(gameState.diceValue, STATE.rolling, STATE.animating || gameState.phase !== 'waiting' || currentPlayer.isAI, theme.main)}
        </div>
        <div class="game-hint">&nbsp;</div>
      </div>
    </div>

    ${STATE.exitPrompt.open ? `
      <div class="exit-modal-backdrop">
        <div class="exit-modal">
          <div class="exit-modal-header">
            <div>
              <div class="exit-title">Exit Match</div>
              <div class="exit-sub">Are you sure you want to exit?</div>
            </div>
            <button class="exit-close" id="exit-cancel">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>

          ${canChooseLeave ? `
            <div class="exit-options">
              ${gameState.players.map((p, idx) => `
                <button class="exit-option" data-exit-player="${idx}">
                  <span class="exit-dot" style="background:${PLAYER_THEME[p.color].main}; box-shadow: 0 0 10px ${PLAYER_THEME[p.color].glow};"></span>
                  <span class="exit-name">${escapeHtml(p.name)}</span>
                  <span class="exit-action">Leave Player</span>
                </button>
              `).join('')}
            </div>
            <div class="exit-footer">
              <button class="exit-btn exit-ghost" id="exit-cancel-2">Cancel</button>
              <button class="exit-btn exit-danger" id="exit-all">Exit All</button>
            </div>
          ` : `
            <div class="exit-footer single">
              <button class="exit-btn exit-ghost" id="exit-cancel-2">Cancel</button>
              <button class="exit-btn exit-danger" id="exit-all">Exit Match</button>
            </div>
          `}
        </div>
      </div>
    ` : ''}
  `;

  renderIcons();

  const homeButton = document.getElementById('home-button');
  if (homeButton) {
    homeButton.addEventListener('click', () => {
      playClickSound();
      openExitPrompt();
    });
  }

  const diceButton = document.getElementById('dice-button');
  if (diceButton) {
    diceButton.addEventListener('click', () => {
      handleRoll();
    });
  }

  document.querySelectorAll('[data-token-id][data-clickable="true"]').forEach((token) => {
    token.addEventListener('click', () => {
      const tokenId = Number(token.dataset.tokenId);
      handleTokenClick(tokenId);
    });
  });

  const soundButton = document.getElementById('sound-button');
  if (soundButton) {
    soundButton.addEventListener('click', () => {
      if (STATE.soundOn) playClickSound();
      STATE.soundOn = !STATE.soundOn;
      localStorage.setItem('ludoSound', STATE.soundOn ? 'on' : 'off');
      renderGameScreen();
    });
  }

  scheduleAI();

  const exitCancel = document.getElementById('exit-cancel');
  if (exitCancel) exitCancel.addEventListener('click', () => {
    playClickSound();
    closeExitPrompt();
  });
  const exitCancel2 = document.getElementById('exit-cancel-2');
  if (exitCancel2) exitCancel2.addEventListener('click', () => {
    playClickSound();
    closeExitPrompt();
  });
  const exitAll = document.getElementById('exit-all');
  if (exitAll) exitAll.addEventListener('click', () => {
    playClickSound();
    closeExitPrompt();
    goHome();
  });

  document.querySelectorAll('[data-exit-player]').forEach((button) => {
    button.addEventListener('click', () => {
      playClickSound();
      const idx = Number(button.getAttribute('data-exit-player'));
      leavePlayer(idx);
    });
  });
}

function openExitPrompt() {
  STATE.exitPrompt.open = true;
  renderGameScreen();
}

function closeExitPrompt() {
  STATE.exitPrompt.open = false;
  renderGameScreen();
}

function leavePlayer(index) {
  if (!STATE.gameState || !STATE.config) return;
  const player = STATE.gameState.players[index];
  if (!player) return;
  const remainingHumans = STATE.gameState.players.filter((p, i) => i !== index && !p.isAI).length;
  if (remainingHumans === 0) {
    closeExitPrompt();
    goHome();
    return;
  }

  player.isAI = true;
  if (!player.name || player.name.toLowerCase() === 'player') {
    player.name = 'Bot';
  }
  if (!player.name.toLowerCase().includes('bot')) {
    player.name = `${player.name} (Bot)`;
  }
  closeExitPrompt();
  scheduleAI();
}

function renderDice(value, rolling, disabled, playerColor) {
  const displayValue = value || STATE.diceFace || 1;
  const disabledClass = disabled || rolling ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer';

  const buildFace = (num) => {
    const d = {
      1: [[50,50]],
      2: [[25,25],[75,75]],
      3: [[25,25],[50,50],[75,75]],
      4: [[25,25],[75,25],[25,75],[75,75]],
      5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
      6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]]
    }[num];
    return `
      <div class="dice-face face-${num}">
        <svg viewBox="0 0 100 100" class="w-full h-full">
          ${d.map(([cx,cy]) => `<circle cx="${cx}" cy="${cy}" r="11" class="dice-dot"></circle>`).join('')}
        </svg>
      </div>`;
  };

  const targetMapping = {
    1: {x: 0, y: 0, z: 0},
    6: {x: 180, y: 0, z: 0},
    3: {x: 0, y: -90, z: 0},
    4: {x: 0, y: 90, z: 0},
    2: {x: -90, y: 0, z: 0},
    5: {x: 90, y: 0, z: 0}
  };
  const target = targetMapping[displayValue] || targetMapping[1];
  const start = STATE.diceRotation || target;
  const spin = STATE.diceSpin || { x: 720, y: 900, z: 360 };

  const cubeStyle = [
    `--start-x:${start.x}deg;`,
    `--start-y:${start.y}deg;`,
    `--start-z:${start.z}deg;`,
    `--spin-x:${spin.x}deg;`,
    `--spin-y:${spin.y}deg;`,
    `--spin-z:${spin.z}deg;`,
    `--end-x:${target.x}deg;`,
    `--end-y:${target.y}deg;`,
    `--end-z:${target.z}deg;`,
    `box-shadow:${rolling ? '0 20px 30px rgba(0,0,0,0.6)' : '0 10px 15px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8)'};`
  ].join(' ');

  return `
    <div class="dice-container w-20 h-20 perspective-1000">
      <button id="dice-button" ${disabled || rolling ? 'disabled' : ''} class="dice-wrapper w-16 h-16 relative ${disabledClass} ${rolling ? 'animate-dice-bounce' : ''}" style="${disabled && !rolling ? 'opacity:0.6' : ''}">
        <div class="dice-cube ${rolling ? 'dice-rolling' : ''}" style="${cubeStyle}">
          ${[1,6,3,4,2,5].map(buildFace).join('')}
        </div>
      </button>
    </div>
  `;
}

function createDiceSpin() {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  return {
    x: rand(720, 1080),
    y: rand(900, 1260),
    z: rand(360, 720),
  };
}

function renderBoard(gameState, validMoves) {
  const cells = [];
  for (let r = 0; r < 15; r += 1) {
    for (let c = 0; c < 15; c += 1) {
      const info = getCellInfo(r, c);
      const isCenter = info.bg === 'center';
      
      let cellClass = '';
      if (isCenter) cellClass = 'cell-center';
      else if (info.bg === 'normal') cellClass = 'cell-normal';
      else cellClass = `cell-${info.bg}`;

      const styles = [
        `grid-row: ${r + 1};`,
        `grid-column: ${c + 1};`
      ];

      const content = [];
      if (info.isStar) {
        content.push(`
          <img src="${STAR_IMAGE}" alt="Safe" class="absolute inset-0 m-auto" style="width:60%; height:60%; object-fit:contain; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));" />
        `);
      }
      if (info.isStart) {
        content.push(`
          <div class="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" style="width:50%; height:50%; color: #fff; opacity: 0.6; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">
              <polygon points="12,2 15,9 22,9 16.5,13.5 18.5,21 12,16.5 5.5,21 7.5,13.5 2,9 9,9" fill="currentColor"></polygon>
            </svg>
          </div>
        `);
      }
      cells.push(`<div class="relative ${cellClass}" style="${styles.join(' ')}">${content.join('')}</div>`);
    }
  }

  const allTokens = [];
  gameState.players.forEach((player) => {
    player.tokens.forEach((token) => {
      const pos = getTokenPosition(player.color, token, gameState);
      allTokens.push({ color: player.color, token, pos });
    });
  });

  const groups = new Map();
  allTokens.forEach((item) => {
    const key = `${item.pos[0].toFixed(2)},${item.pos[1].toFixed(2)}`;
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  });

  const stackOffsets = [
    [[0, 0]],
    [[-0.15, -0.15], [0.15, 0.15]],
    [[-0.15, -0.15], [0.15, -0.15], [0, 0.15]],
    [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]],
  ];

  const tokensHtml = Array.from(groups.values()).map((group) => {
    return group.map((item, idx) => {
      const offset = stackOffsets[Math.min(group.length, 4) - 1][idx] || [0, 0];
      const row = item.pos[0] + offset[0];
      const col = item.pos[1] + offset[1];
      const x = ((col + 0.5) / 15) * 100;
      const y = ((row + 0.5) / 15) * 100;
      const isClickable = item.color === gameState.players[gameState.currentPlayerIndex].color && validMoves.includes(item.token.id);
      const isFinished = item.token.progress > TOTAL_PROGRESS;
      const theme = PLAYER_THEME[item.color];
      const key = `${item.color}-${item.token.id}`;
      const anim = STATE.animateTokens.get(key);
      const from = anim ? anim.from : null;
      const duration = anim ? anim.duration : 0;
      const shouldAnimate = Boolean(from && (from.x !== x || from.y !== y));
      const positionStyle = shouldAnimate
        ? `--from-left:${from.x}%; --from-top:${from.y}%; --to-left:${x}%; --to-top:${y}%; --step-dur:${duration}ms; left: var(--to-left); top: var(--to-top);`
        : `left:${x}%; top:${y}%;`;
      STATE.lastTokenPositions.set(key, { x, y });
      const tokenImage = TOKEN_IMAGES[item.color] || '';
      return `
        <div data-token-id="${item.token.id}" data-clickable="${isClickable}" class="token-piece token-image absolute rounded-full z-10 ${shouldAnimate ? 'token-step' : ''} ${isClickable ? 'cursor-pointer animate-token-glow animate-token-bounce' : ''} ${isFinished ? 'opacity-0 pointer-events-none' : ''}" style="${positionStyle} --tk-glow:${theme.glow}; transform:translate(-50%, -50%) translateY(var(--token-float, 0px)); width:${(1 / 15) * 140}%; height:${(1 / 15) * 140}%;">
          <img src="${tokenImage}" alt="${item.color} token" class="token-img" />
          ${isClickable ? `<div class="absolute animate-pulse-ring rounded-full"></div>` : ''}
        </div>
      `;
    }).join('');
  }).join('');

  const finishByColor = new Map(gameState.players.map((p) => [p.color, p.finishOrder]));
  const showWinBadges = gameState.players.length >= 3;
  const finishedCounts = ALL_COLORS.reduce((acc, color) => {
    acc[color] = 0;
    return acc;
  }, {});
  gameState.players.forEach((player) => {
    player.tokens.forEach((token) => {
      if (token.progress === TOTAL_PROGRESS) finishedCounts[player.color] += 1;
    });
  });

  const activeColors = gameState.players.map((p) => p.color);
  const homeBases = ALL_COLORS.map((color) => {
    const offset = getHomeOffsetForColor(color, gameState);
    const finishOrder = finishByColor.get(color) || 0;
    const winBadge = showWinBadges && finishOrder > 0 && finishOrder <= 3
      ? `<img src="images/win${finishOrder}.png" alt="Winner ${finishOrder}" class="win-badge" />`
      : '';
    return `
      <div class="absolute rounded-[16px] home-base-${color}" style="left:${(offset.left / 15) * 100}%; top:${(offset.top / 15) * 100}%; width:${(6 / 15) * 100}%; height:${(6 / 15) * 100}%;">
        <div class="absolute inset-0 m-auto bg-white/10 rounded-2xl" style="width: 70%; height: 70%; box-shadow: inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.3);">
          ${[0, 1, 2, 3].map((i) => {
            const positions = [[25, 25], [75, 25], [25, 75], [75, 75]];
            return `
              <div class="absolute inner-slot" style="left:${positions[i][0]}%; top:${positions[i][1]}%; width:35%; height:35%; transform:translate(-50%,-50%);"></div>
            `;
          }).join('')}
        </div>
        ${winBadge}
      </div>
    `;
  }).join('');

  const centerHome = `
    <div class="center-home">
      <div class="center-home-inner">
        <div class="center-tri center-tri-blue home-base-green"></div>
        <div class="center-tri center-tri-red home-base-yellow"></div>
        <div class="center-tri center-tri-green home-base-blue"></div>
        <div class="center-tri center-tri-yellow home-base-red"></div>
        ${finishedCounts.blue ? `<div class="center-count center-count-blue">${finishedCounts.blue}</div>` : ''}
        ${finishedCounts.red ? `<div class="center-count center-count-red">${finishedCounts.red}</div>` : ''}
        ${finishedCounts.green ? `<div class="center-count center-count-green">${finishedCounts.green}</div>` : ''}
        ${finishedCounts.yellow ? `<div class="center-count center-count-yellow">${finishedCounts.yellow}</div>` : ''}
      </div>
    </div>
  `;

  STATE.animateTokens.clear();
  return `
    <div class="board-container relative mx-auto">
      <div class="absolute inset-[8px] grid overflow-hidden rounded-xl" style="grid-template-columns:repeat(15,1fr); grid-template-rows:repeat(15,1fr); box-shadow: 0 4px 10px rgba(0,0,0,0.4);">
        ${cells.join('')}
      </div>
      <div class="absolute inset-[8px]">
        ${centerHome}
        ${homeBases}
        ${tokensHtml}
      </div>
    </div>
  `;
}

function renderResultScreen() {
  if (!STATE.finalState) {
    goHome();
    return;
  }

  const sorted = [...STATE.finalState.players].sort((a, b) => a.finishOrder - b.finishOrder);

  app.innerHTML = `
    <div class="fixed inset-0 bg-transparent flex flex-col items-center justify-center p-6 result-screen">
      <div class="result-winner-badge">
        <img src="images/winner.png" alt="Winner" />
      </div>
      <h2 class="text-3xl font-black text-foreground mb-1">Game Over!</h2>
      <p class="text-muted-foreground text-sm mb-8">Final Rankings</p>

      <div class="w-full max-w-sm space-y-3 mb-10">
        ${sorted.map((player, i) => {
          const theme = PLAYER_THEME[player.color];
          const isWinner = i === 0;
          const tokenImage = TOKEN_IMAGES[player.color] || '';
          const badgeImg = i < 3 ? `images/win${i + 1}.png` : (i === 3 ? 'images/lose.png' : '');
          const playerCount = sorted.length;
      return `
            <div class="result-row animate-slide-up ${isWinner ? 'winner' : ''}" style="animation-delay: ${i * 150}ms; animation-fill-mode: backwards; --row-accent:${theme.main}; --row-glow:${theme.glow};">
              <div class="result-token">
                <img src="${tokenImage}" alt="${player.color} token" />
              </div>
              <div class="result-info">
                <div class="result-name">${escapeHtml(player.name)}</div>
                <div class="result-color">${player.color}</div>
              </div>
              <div class="result-badge">
                ${(() => {
                  if (playerCount === 2) {
                    return i === 0 ? `<img src="images/win1.png" alt="Winner" />` : `<img src="images/lose.png" alt="Lose" />`;
                  }
                  if (playerCount === 3) {
                    return i === 0 ? `<img src="images/win1.png" alt="Winner" />` : (i === 1 ? `<img src="images/win2.png" alt="Second" />` : `<img src="images/lose.png" alt="Lose" />`);
                  }
                  return i < 3 ? `<img src="images/win${i + 1}.png" alt="Rank ${i + 1}" />` : (i === 3 ? `<img src="images/lose.png" alt="Lose" />` : '<span class="result-empty"></span>');
                })()}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="flex gap-3">
        <button id="replay-button" class="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:shadow-lg active:scale-95 transition-all">
          <i data-lucide="rotate-ccw" class="w-4 h-4"></i> Play Again
        </button>
        <button id="home-button" class="flex items-center gap-2 text-black px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-bold text-sm hover:bg-secondary/80 active:scale-95 transition-all">
          <i data-lucide="home" class="w-4 h-4 text-black"></i> Home
        </button>
      </div>
    </div>
  `;

  renderIcons();

  const replayButton = document.getElementById('replay-button');
  if (replayButton) {
    replayButton.addEventListener('click', () => {
      playClickSound();
      if (STATE.config) {
        startGame(STATE.config);
      } else {
        goHome();
      }
    });
  }

  const homeButton = document.getElementById('home-button');
  if (homeButton) {
    homeButton.addEventListener('click', () => {
      playClickSound();
      goHome();
    });
  }
}

function createGame(configs) {
  return {
    players: configs.map((c) => ({
      color: c.color,
      name: c.name,
      tokens: [0, 1, 2, 3].map((id) => ({ id, progress: -1 })),
      isAI: c.isAI,
      finishOrder: 0,
    })),
    currentPlayerIndex: 0,
    diceValue: null,
    phase: 'waiting',
    consecutiveSixes: 0,
    finishCount: 0,
    gameOver: false,
    validMoves: [],
  };
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function getValidMoves(state) {
  const player = state.players[state.currentPlayerIndex];
  const dice = state.diceValue;
  if (!dice) return [];
  return player.tokens.filter((token) => {
  if (token.progress === TOTAL_PROGRESS) return false;
    if (token.progress === -1) return dice === 6;
    return token.progress + dice <= TOTAL_PROGRESS;
  }).map((token) => token.id);
}

function calculateTokenProgress(color, currentProgress, dice) {
  if (currentProgress < 0) return dice === 6 ? 0 : -1;
  if (currentProgress >= PATH_LENGTH) return currentProgress + dice;

  const currentIndex = (PLAYER_START[color] + currentProgress) % PATH_LENGTH;
  const entryIndex = HOME_ENTRY_INDEX[color];
  const stepsToEntry = (entryIndex - currentIndex + PATH_LENGTH) % PATH_LENGTH;

  if (dice <= stepsToEntry) {
    return currentProgress + dice;
  }

  return PATH_LENGTH + (dice - stepsToEntry - 1);
}

function executeMove(state, tokenId) {
  const newState = JSON.parse(JSON.stringify(state));
  const player = newState.players[newState.currentPlayerIndex];
  const token = player.tokens.find((item) => item.id === tokenId);
  if (!token) return { newState, captured: false };
  const dice = newState.diceValue;
  let captured = false;

  if (token.progress === -1) {
    token.progress = 0;
    captured = checkCapture(newState, player.color, 0);
  } else {
    token.progress = calculateTokenProgress(player.color, token.progress, dice);
    if (token.progress <= PATH_LENGTH - 1) {
      captured = checkCapture(newState, player.color, token.progress);
    }
  }

  if (player.tokens.every((item) => item.progress === TOTAL_PROGRESS)) {
    newState.finishCount += 1;
    player.finishOrder = newState.finishCount;
    const remaining = newState.players.filter((p) => p.finishOrder === 0);
    if (remaining.length <= 1) {
      newState.gameOver = true;
      remaining.forEach((p) => {
        newState.finishCount += 1;
        p.finishOrder = newState.finishCount;
      });
    }
  }

  const gotSix = dice === 6;
  const sixes = gotSix ? newState.consecutiveSixes + 1 : 0;

  if (sixes >= 3) {
    newState.consecutiveSixes = 0;
    advancePlayer(newState);
  } else if (gotSix || captured) {
    newState.consecutiveSixes = sixes;
  } else {
    newState.consecutiveSixes = 0;
    advancePlayer(newState);
  }

  newState.diceValue = null;
  newState.phase = 'waiting';
  newState.validMoves = [];
  return { newState, captured };
}

function checkCapture(state, color, progress) {
  if (progress > PATH_LENGTH - 1) return false;
  const idx = (PLAYER_START[color] + progress) % PATH_LENGTH;
  if (SAFE_INDICES.has(idx)) return false;
  let captured = false;
  state.players.forEach((player) => {
    if (player.color === color) return;
    player.tokens.forEach((token) => {
      if (token.progress < 0 || token.progress > PATH_LENGTH - 1) return;
      const tokenIdx = (PLAYER_START[player.color] + token.progress) % PATH_LENGTH;
      if (tokenIdx === idx) {
        token.progress = -1;
        captured = true;
      }
    });
  });
  return captured;
}

function advancePlayer(state) {
  const len = state.players.length;
  let next = (state.currentPlayerIndex + 1) % len;
  let attempts = 0;
  while (state.players[next].finishOrder > 0 && attempts < len) {
    next = (next + 1) % len;
    attempts += 1;
  }
  state.currentPlayerIndex = next;
}

function getAIMove(state, validMoves) {
  if (validMoves.length <= 1) return validMoves[0] ?? -1;
  const player = state.players[state.currentPlayerIndex];
  const dice = state.diceValue;
  let best = validMoves[0];
  let bestScore = -Infinity;

  validMoves.forEach((tid) => {
    const token = player.tokens.find((item) => item.id === tid);
    if (!token) return;
    let score = 0;
    const newProgress = token.progress === -1 ? 0 : token.progress + dice;
    if (newProgress === TOTAL_PROGRESS) score += 100;
    else if (newProgress >= PATH_LENGTH) score += 50;
    if (token.progress === -1) score += 25;
    if (newProgress >= 0 && newProgress <= PATH_LENGTH - 1) {
      const idx = (PLAYER_START[player.color] + newProgress) % PATH_LENGTH;
      if (SAFE_INDICES.has(idx)) score += 15;
      else {
        state.players.forEach((other) => {
          if (other.color === player.color) return;
          other.tokens.forEach((ot) => {
            if (ot.progress < 0 || ot.progress > PATH_LENGTH - 1) return;
            if ((PLAYER_START[other.color] + ot.progress) % PATH_LENGTH === idx) {
              score += 60;
            }
          });
        });
      }
    }
    score += newProgress * 0.3 + Math.random() * 8;
    if (score > bestScore) {
      bestScore = score;
      best = tid;
    }
  });

  return best;
}

function getTokenPosition(color, token, state = STATE.gameState) {
  if (token.progress === -1) return getHomeBaseSlotsForColor(color, state)[token.id];
  if (token.progress <= PATH_LENGTH - 1) {
    const idx = (PLAYER_START[color] + token.progress) % PATH_LENGTH;
    return MAIN_PATH[idx];
  }
  if (token.progress <= TOTAL_PROGRESS - 1) return HOME_COLUMNS[color][token.progress - PATH_LENGTH];
  if (token.progress === TOTAL_PROGRESS) return [7, 7];
  return [7, 7];
}

function getCellInfo(row, col) {
  if (row <= 5 && col <= 5) return { bg: 'null', border: false };
  if (row <= 5 && col >= 9) return { bg: 'null', border: false };
  if (row >= 9 && col >= 9) return { bg: 'null', border: false };
  if (row >= 9 && col <= 5) return { bg: 'null', border: false };
  
  if (row === 7 && col >= 1 && col <= 5) return { bg: 'red', border: true };
  if (col === 7 && row >= 1 && row <= 5) return { bg: 'green', border: true };
  if (row === 7 && col >= 9 && col <= 13) return { bg: 'yellow', border: true };
  if (col === 7 && row >= 9 && row <= 13) return { bg: 'blue', border: true };
  
  if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
    if (row === 7 && col === 7) return { bg: 'center', border: false };
    return { bg: 'null', border: false };
  }
  
  const key = `${row},${col}`;
  const safeType = SAFE_CELLS.get(key);
  if (safeType === 'star') return { bg: 'normal', border: true, isStar: true };
  if (safeType) return { bg: safeType, border: true, isStart: safeType };
  return { bg: 'normal', border: true };
}

function isInnerHome(row, col) {
  if (row >= 1 && row <= 4 && col >= 1 && col <= 4) return 'red';
  if (row >= 1 && row <= 4 && col >= 10 && col <= 13) return 'green';
  if (row >= 10 && row <= 13 && col >= 10 && col <= 13) return 'yellow';
  if (row >= 10 && row <= 13 && col >= 1 && col <= 4) return 'blue';
  return null;
}

function progressPercent(player) {
  const total = player.tokens.reduce((sum, token) => sum + Math.max(0, token.progress), 0);
  return Math.round((total / (TOTAL_PROGRESS * 4)) * 100);
}

function handleRoll() {
  if (!STATE.gameState || STATE.rolling || STATE.animating || STATE.gameState.phase !== 'waiting') return;
  STATE.rolling = true;
  STATE.message = 'Rolling...';
  playSound('dice', { volume: 0.75, startAt: 0.12 });

  const dice = rollDice();
  const targetMap = {
    1: {x: 0, y: 0, z: 0},
    6: {x: 180, y: 0, z: 0},
    3: {x: 0, y: -90, z: 0},
    4: {x: 0, y: 90, z: 0},
    2: {x: -90, y: 0, z: 0},
    5: {x: 90, y: 0, z: 0}
  };
  const target = targetMap[dice];

  STATE.diceSpin = createDiceSpin();
  STATE.diceTarget = target;
  STATE.diceFace = dice;

  renderApp();

  setTimeout(() => {
    STATE.gameState.diceValue = dice;
    STATE.diceRotation = target;
    STATE.gameState.phase = 'rolled';
    STATE.gameState.validMoves = getValidMoves(STATE.gameState);

    if (STATE.gameState.validMoves.length === 0) {
      STATE.message = `Rolled ${dice} ? No valid moves`;
      STATE.advanceTimer = setTimeout(() => {
        STATE.gameState.consecutiveSixes = 0;
        STATE.gameState.diceValue = null;
        STATE.gameState.phase = 'waiting';
        STATE.gameState.validMoves = [];
        advancePlayer(STATE.gameState);
        STATE.message = '';
        renderApp();
      }, 1200);
    } else if (STATE.gameState.validMoves.length === 1) {
      const autoTokenId = STATE.gameState.validMoves[0];
      STATE.message = `Rolled ${dice} ? Auto move`;
      STATE.advanceTimer = setTimeout(() => {
        if (!STATE.gameState || STATE.animating || STATE.gameState.phase !== 'rolled') return;
        handleTokenClick(autoTokenId);
      }, 350);
    } else {
      STATE.message = `Rolled ${dice} ? Pick a token`;
    }

    STATE.rolling = false;
    renderApp();
  }, 900);
}

function handleTokenClick(tokenId) {
  if (!STATE.gameState || STATE.animating || STATE.gameState.phase !== 'rolled' || !STATE.gameState.validMoves.includes(tokenId)) return;
  const { newState, captured } = executeMove(STATE.gameState, tokenId);
  animateTokenMovement(tokenId, newState, captured);
}

function scheduleAI() {
  if (STATE.aiTimer) {
    clearTimeout(STATE.aiTimer);
    STATE.aiTimer = null;
  }
  if (!STATE.gameState) return;
  if (STATE.animating || STATE.gameState.phase === 'animating') return;
  const current = STATE.gameState.players[STATE.gameState.currentPlayerIndex];
  if (!current.isAI || STATE.gameState.gameOver) return;

  if (STATE.gameState.phase === 'waiting') {
    STATE.aiTimer = setTimeout(() => {
      handleRoll();
    }, 800);
  } else if (STATE.gameState.phase === 'rolled' && STATE.gameState.validMoves.length > 0) {
    STATE.aiTimer = setTimeout(() => {
      const move = getAIMove(STATE.gameState, STATE.gameState.validMoves);
      if (move >= 0) handleTokenClick(move);
    }, 600);
  }
}

function gotoResult() {
  if (!STATE.gameState) return;
  const completed = STATE.gameState.players.filter((player) => player.finishOrder > 0).length;
  if (completed < STATE.gameState.players.length) {
    const remaining = STATE.gameState.players.filter((player) => player.finishOrder === 0);
    let nextOrder = STATE.gameState.finishCount + 1;
    remaining.forEach((player) => {
      player.finishOrder = nextOrder;
      nextOrder += 1;
    });
  }
  STATE.screen = 'result';
  STATE.finalState = STATE.gameState;
  playSound('result', { volume: 0.85 });
  renderApp();
}

function animateTokenMovement(tokenId, finalState, captured) {
  if (!STATE.gameState) return;
  if (STATE.moveTimer) {
    clearTimeout(STATE.moveTimer);
    STATE.moveTimer = null;
  }
  const startState = STATE.gameState;
  const dice = startState.diceValue || 0;
  const animState = JSON.parse(JSON.stringify(startState));
  const player = animState.players[animState.currentPlayerIndex];
  const token = player.tokens.find((item) => item.id === tokenId);
  if (!token) {
    STATE.gameState = finalState;
    renderApp();
    return;
  }

  const steps = [];
  if (token.progress === -1) {
    steps.push(0);
  } else {
    const end = token.progress + dice;
    for (let p = token.progress + 1; p <= end; p += 1) steps.push(p);
  }

  const stepDuration = 180;
  const stepGap = 30;
  const shouldWinSound = startState.finishCount === 0 && finalState.finishCount >= 1 && finalState.players.length >= 3;

  const getCapturedTokens = (prevState, nextState) => {
    const list = [];
    nextState.players.forEach((nextPlayer) => {
      const prevPlayer = prevState.players.find((p) => p.color === nextPlayer.color);
      if (!prevPlayer) return;
      nextPlayer.tokens.forEach((nextToken) => {
        const prevToken = prevPlayer.tokens.find((t) => t.id === nextToken.id);
        if (!prevToken) return;
        if (prevToken.progress >= 0 && prevToken.progress <= PATH_LENGTH - 1 && nextToken.progress === -1) {
          list.push({ color: nextPlayer.color, id: nextToken.id, fromProgress: prevToken.progress });
        }
      });
    });
    return list;
  };

  const capturedTokens = captured ? getCapturedTokens(startState, finalState) : [];

  const animateCapturedReturn = (tokens, baseState, done) => {
    if (!tokens.length) {
      done();
      return;
    }
    const animCapturedState = JSON.parse(JSON.stringify(baseState));
    animCapturedState.phase = 'animating';
    animCapturedState.validMoves = [];
    STATE.gameState = animCapturedState;
    STATE.animating = true;

    const animateSingle = (tokenInfo, next) => {
      const playerRef = animCapturedState.players.find((p) => p.color === tokenInfo.color);
      if (!playerRef) { next(); return; }
      const tokenRef = playerRef.tokens.find((t) => t.id === tokenInfo.id);
      if (!tokenRef) { next(); return; }

      tokenRef.progress = tokenInfo.fromProgress;
      STATE.gameState = animCapturedState;
      renderApp();

      const stepsReverse = [];
      for (let p = tokenInfo.fromProgress - 1; p >= 0; p -= 1) stepsReverse.push(p);
      stepsReverse.push(-1);

      let sidx = 0;
      const key = `${tokenInfo.color}-${tokenInfo.id}`;
      const stepBack = () => {
        if (!STATE.animating || !STATE.gameState) return;
        if (sidx >= stepsReverse.length) {
          next();
          return;
        }

        const fromPos = STATE.lastTokenPositions.get(key);
        if (fromPos) {
          STATE.animateTokens.set(key, { from: { x: fromPos.x, y: fromPos.y }, duration: 70 });
        }

        tokenRef.progress = stepsReverse[sidx];
        STATE.gameState = animCapturedState;
        renderApp();
        sidx += 1;
        STATE.moveTimer = setTimeout(stepBack, 80);
      };

      STATE.moveTimer = setTimeout(stepBack, 20);
    };

    let i = 0;
    const nextToken = () => {
      if (i >= tokens.length) {
        STATE.animating = false;
        STATE.gameState = baseState;
        renderApp();
        done();
        return;
      }
      animateSingle(tokens[i], () => {
        i += 1;
        nextToken();
      });
    };

    nextToken();
  };

  STATE.animating = true;
  STATE.message = 'Moving...';
  animState.phase = 'animating';
  animState.validMoves = [];
  STATE.gameState = animState;
  renderApp();

  let index = 0;
  const key = `${player.color}-${token.id}`;

  const stepOnce = () => {
    if (!STATE.animating || !STATE.gameState) return;
    if (index >= steps.length) {
      finishMove();
      return;
    }

    const fromPos = STATE.lastTokenPositions.get(key);
    if (fromPos) {
      STATE.animateTokens.set(key, { from: { x: fromPos.x, y: fromPos.y }, duration: stepDuration });
    } else {
      const fallback = getTokenPosition(player.color, token, animState);
      const fallbackX = ((fallback[1] + 0.5) / 15) * 100;
      const fallbackY = ((fallback[0] + 0.5) / 15) * 100;
      STATE.animateTokens.set(key, { from: { x: fallbackX, y: fallbackY }, duration: stepDuration });
    }

    playSound('move', { volume: 0.5 });
    token.progress = steps[index];
    STATE.gameState = animState;
    renderApp();
    index += 1;
    STATE.moveTimer = setTimeout(stepOnce, stepDuration + stepGap);
  };

  const finishMove = () => {
    STATE.animating = false;
    STATE.gameState = finalState;
    STATE.moveTimer = null;

    if (capturedTokens.length) {
      STATE.captureEffect = true;
      STATE.message = 'Captured! Returning...';
      playSound('kill', { volume: 0.85 });
      if (shouldWinSound) playSound('win', { volume: 0.85 });
      renderApp();
      setTimeout(() => {
        STATE.captureEffect = false;
        renderApp();
        animateCapturedReturn(capturedTokens, finalState, () => {
          STATE.message = '';
          if (finalState.gameOver) {
            setTimeout(() => gotoResult(), 800);
          }
        });
      }, 250);
      return;
    }

    STATE.message = '';
    if (shouldWinSound) playSound('win', { volume: 0.85 });

    if (finalState.gameOver) {
      setTimeout(() => gotoResult(), 1000);
    }

    renderApp();
  };

  STATE.moveTimer = setTimeout(stepOnce, 30);
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
