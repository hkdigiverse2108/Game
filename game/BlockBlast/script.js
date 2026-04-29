/* Block Blast - vanilla JS + Tailwind */
const root = document.getElementById('game-root');

const GRID_SIZE = 10;

const ASSETS = {
  starFill: 'startFill.webp',
  starEmpty: 'star empty.webp',
  lock: 'lock.webp',
  pause: 'pause.webp',
  spark: 'spark.webp',
  blastParticles: 'blast particles.webp',
  blockGloss: 'block-gloss.webp',
  win: 'win.webp',
  lose: 'lose.webp'
};

const PERF = {
  low: window.matchMedia('(max-width: 768px)').matches
};

if (PERF.low) {
  document.documentElement.classList.add('perf-low');
}

const sounds = {
  blast: new Audio('audio/blast.wav'),
  place: new Audio('audio/place.mp3'),
  win: new Audio('audio/win.wav'),
  lose: new Audio('audio/lose.wav')
};
sounds.blast.volume = 0.6;
sounds.place.volume = 0.55;
sounds.win.volume = 0.7;
sounds.lose.volume = 0.7;

function playSound(key) {
  try {
    const s = sounds[key];
    if (!s) return;
    s.currentTime = 0;
    s.play().catch(() => {});
  } catch (_) {}
}

function asset(file) {
  return `images/${encodeURIComponent(file)}`;
}

const BLOCK_COLORS = [
  '340 82% 52%',
  '25 95% 53%',
  '45 93% 48%',
  '142 60% 42%',
  '200 80% 48%',
  '262 70% 55%',
  '180 60% 42%',
  '0 75% 50%'
];

const SHAPE_TEMPLATES = [
  { id: 'dot', cells: [[1]], difficulty: 1 },
  { id: 'h2', cells: [[1, 1]], difficulty: 1 },
  { id: 'v2', cells: [[1], [1]], difficulty: 1 },
  { id: 'h3', cells: [[1, 1, 1]], difficulty: 1 },
  { id: 'v3', cells: [[1], [1], [1]], difficulty: 1 },
  { id: 'sq2', cells: [[1, 1], [1, 1]], difficulty: 1 },
  { id: 'corner1', cells: [[1, 1], [1, 0]], difficulty: 1 },
  { id: 'corner2', cells: [[1, 1], [0, 1]], difficulty: 1 },
  { id: 'corner3', cells: [[0, 1], [1, 1]], difficulty: 1 },
  { id: 'corner4', cells: [[1, 0], [1, 1]], difficulty: 1 },
  { id: 'l1', cells: [[1, 0], [1, 0], [1, 1]], difficulty: 2 },
  { id: 'l2', cells: [[0, 1], [0, 1], [1, 1]], difficulty: 2 },
  { id: 'l3', cells: [[1, 1], [1, 0], [1, 0]], difficulty: 2 },
  { id: 'l4', cells: [[1, 1], [0, 1], [0, 1]], difficulty: 2 },
  { id: 't1', cells: [[1, 1, 1], [0, 1, 0]], difficulty: 2 },
  { id: 't2', cells: [[0, 1, 0], [1, 1, 1]], difficulty: 2 },
  { id: 't3', cells: [[1, 0], [1, 1], [1, 0]], difficulty: 2 },
  { id: 't4', cells: [[0, 1], [1, 1], [0, 1]], difficulty: 2 },
  { id: 'h4', cells: [[1, 1, 1, 1]], difficulty: 2 },
  { id: 'v4', cells: [[1], [1], [1], [1]], difficulty: 2 },
  { id: 's1', cells: [[0, 1, 1], [1, 1, 0]], difficulty: 2 },
  { id: 'z1', cells: [[1, 1, 0], [0, 1, 1]], difficulty: 2 },
  { id: 's2', cells: [[1, 0], [1, 1], [0, 1]], difficulty: 2 },
  { id: 'z2', cells: [[0, 1], [1, 1], [1, 0]], difficulty: 2 },
  { id: 'h5', cells: [[1, 1, 1, 1, 1]], difficulty: 3 },
  { id: 'v5', cells: [[1], [1], [1], [1], [1]], difficulty: 3 },
  { id: 'sq3', cells: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], difficulty: 3 },
  { id: 'bigL1', cells: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], difficulty: 3 },
  { id: 'bigL2', cells: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], difficulty: 3 },
  { id: 'plus', cells: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], difficulty: 3 }
];

const LEVELS = Array.from({ length: 20 }, (_, i) => {
  const level = i + 1;
  let maxDifficulty;
  let prefillCount;
  let targetScore;
  let moves;

  if (level <= 5) {
    maxDifficulty = 1;
    prefillCount = 0;
    targetScore = 50 + (level - 1) * 20;
    moves = 40 - (level - 1) * 2;
  } else if (level <= 10) {
    maxDifficulty = 2;
    prefillCount = Math.floor((level - 5) * 3);
    targetScore = 150 + (level - 6) * 40;
    moves = 32 - (level - 6) * 2;
  } else if (level <= 15) {
    maxDifficulty = 2;
    prefillCount = 15 + (level - 11) * 4;
    targetScore = 350 + (level - 11) * 50;
    moves = 26 - (level - 11);
  } else {
    maxDifficulty = 3;
    prefillCount = 30 + (level - 16) * 5;
    targetScore = 600 + (level - 16) * 80;
    moves = 25;
  }

  return {
    level,
    targetScore,
    maxDifficulty,
    prefillCount,
    moves,
    starThresholds: [
      targetScore,
      Math.floor(targetScore * 1.2),
      Math.floor(targetScore * 1.5)
    ]
  };
});

function generatePrefill(count) {
  const cells = [];
  const used = new Set();
  const color = '210 15% 75%';

  while (cells.length < count) {
    const row = Math.floor(Math.random() * 10);
    const col = Math.floor(Math.random() * 10);
    const key = `${row},${col}`;
    if (!used.has(key)) {
      used.add(key);
      cells.push({ row, col, color });
    }
  }
  return cells;
}
function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ filled: false, color: '' }))
  );
}

function getRandomShape(maxDifficulty, excludeIds) {
  let available = SHAPE_TEMPLATES.filter(s => s.difficulty <= maxDifficulty);
  if (excludeIds && excludeIds.length > 0 && available.length > excludeIds.length) {
    available = available.filter(s => !excludeIds.includes(s.id));
  }
  const template = available[Math.floor(Math.random() * available.length)];
  const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
  return {
    id: template.id + '_' + Math.random().toString(36).slice(2, 7),
    cells: template.cells,
    color
  };
}

function getShapeTemplateId(shape) {
  return shape.id.split('_')[0];
}

function generateShapeSet(maxDifficulty, count = 3, excludeTemplateIds = []) {
  const shapes = [];
  const usedTemplateIds = [...excludeTemplateIds];
  for (let i = 0; i < count; i++) {
    const shape = getRandomShape(maxDifficulty, usedTemplateIds);
    shapes.push(shape);
    usedTemplateIds.push(getShapeTemplateId(shape));
  }
  return shapes;
}

function getShapeCellCount(cells) {
  return cells.reduce((sum, row) => sum + row.reduce((s, c) => s + c, 0), 0);
}

const TRAY_SCALE = 0.55;

const state = {
  screen: 'loading',
  paused: false,
  unlockedLevel: 1,
  levelBestScores: {},
  levelBestProgress: {},
  grid: createEmptyGrid(),
  score: 0,
  progressScore: 0,
  shapes: [],
  currentLevel: null,
  isGameOver: false,
  isWin: false,
  isLevelComplete: false,
  movesRemaining: 0,
  lastShapeTemplateIds: [],
  clearingCells: new Set(),
  blastParticles: [],
  draggingShape: null,
  dragPos: null,
  ghostPos: null,
  cellSize: 34,
  boardEl: null,
  boardCanvas: null,
  loadingProgress: 0,
  loadingInterval: null,
  lastMove: null
};

let dragRaf = null;
let lastPointer = null;
let lastDragFrameAt = 0;
let dragLayerEl = null;
let dragLayerMeta = null;

function mountDragLayer(shape, grabMeta) {
  unmountDragLayer();
  const floating = createEl('div');
  floating.style.position = 'fixed';
  floating.style.left = '0px';
  floating.style.top = '0px';
  floating.style.pointerEvents = 'none';
  floating.style.zIndex = '9999';
  floating.style.transform = 'translate3d(0px, 0px, 0)';
  floating.style.willChange = 'transform';

  const floatGrid = createEl('div', 'flex flex-col gap-[2px]', { opacity: '0.9' });
  shape.cells.forEach(row => {
    const rowEl = createEl('div', 'flex gap-[2px]');
    row.forEach(cell => {
      const cellEl = createEl('div');
      if (cell) {
        if (PERF.low) {
          cellEl.style.width = `${state.cellSize}px`;
          cellEl.style.height = `${state.cellSize}px`;
          cellEl.style.borderRadius = '4px';
          cellEl.style.background = `hsl(${shape.color})`;
          cellEl.style.boxShadow = '0 2px 6px hsla(0 0% 0% / 0.35)';
        } else {
          Object.assign(cellEl.style, render3DBlock(shape.color, state.cellSize, false));
          cellEl.style.boxShadow = 'inset 0 2px 3px hsla(0 0% 100% / 0.3), inset 0 -2px 3px hsla(0 0% 0% / 0.25), 0 8px 20px hsla(0 0% 0% / 0.4), 0 2px 6px hsla(0 0% 0% / 0.3)';
        }
      } else {
        cellEl.style.width = `${state.cellSize}px`;
        cellEl.style.height = `${state.cellSize}px`;
      }
      rowEl.appendChild(cellEl);
    });
    floatGrid.appendChild(rowEl);
  });

  floating.appendChild(floatGrid);
  document.body.appendChild(floating);
  dragLayerEl = floating;
  dragLayerMeta = {
    rows: shape.cells.length,
    cols: shape.cells[0].length,
    grabX: grabMeta?.grabX ?? null,
    grabY: grabMeta?.grabY ?? null
  };
}

function unmountDragLayer() {
  if (dragLayerEl) {
    dragLayerEl.remove();
    dragLayerEl = null;
    dragLayerMeta = null;
  }
}

function updateDragLayerPosition(x, y) {
  if (!dragLayerEl || !dragLayerMeta) return;
  const lift = PERF.low ? 30 : 60;
  if (typeof dragLayerMeta.grabX === 'number' && typeof dragLayerMeta.grabY === 'number') {
    const tx = Math.round(x - dragLayerMeta.grabX);
    const ty = Math.round(y - dragLayerMeta.grabY - lift);
    dragLayerEl.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    return;
  }
  const dx = (dragLayerMeta.cols * state.cellSize) / 2;
  const dy = (dragLayerMeta.rows * state.cellSize) / 2 + lift;
  const tx = Math.round(x - dx);
  const ty = Math.round(y - dy);
  dragLayerEl.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
}

function updateDragFrame() {
  dragRaf = null;
  const shape = state.draggingShape;
  if (!shape || !lastPointer) return;

  const now = performance.now();
  if (PERF.low && now - lastDragFrameAt < 33) {
    dragRaf = requestAnimationFrame(updateDragFrame);
    return;
  }
  lastDragFrameAt = now;

  const { x, y } = lastPointer;
  state.dragPos = { x, y };

  const shapeRows = shape.cells.length;
  const shapeCols = shape.cells[0].length;
  const offsetY = PERF.low ? 30 : 60;
  const pos = getGridPos(
    x - ((shapeCols - 1) * state.cellSize) / 2,
    y - ((shapeRows - 1) * state.cellSize) / 2 - offsetY
  );
  state.ghostPos = pos;
  updateDragLayerPosition(x, y);
  drawBoardCanvas();
}

function loadProgress() {
  try {
    const raw = sessionStorage.getItem('blockBlastProgress');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data && typeof data === 'object') {
      if (typeof data.unlockedLevel === 'number') state.unlockedLevel = data.unlockedLevel;
      if (data.levelBestScores && typeof data.levelBestScores === 'object') state.levelBestScores = data.levelBestScores;
      if (data.levelBestProgress && typeof data.levelBestProgress === 'object') state.levelBestProgress = data.levelBestProgress;
    }
  } catch (_) {}
}

function saveProgress() {
  try {
    const payload = {
      unlockedLevel: state.unlockedLevel,
      levelBestScores: state.levelBestScores,
      levelBestProgress: state.levelBestProgress
    };
    sessionStorage.setItem('blockBlastProgress', JSON.stringify(payload));
  } catch (_) {}
}

loadProgress();

let shakeAmount = 0;
let shakeDuration = 0;
let shakeRaf = null;

function triggerShake(duration = 1.2, amount = 10) {
  if (PERF.low) return;
  shakeAmount = amount;
  shakeDuration = duration;
  if (!shakeRaf) runShake();
}

function runShake() {
  if (!state.boardEl) {
    shakeRaf = null;
    return;
  }
  if (shakeDuration > 0) {
    const shakeX = (Math.random() - 0.5) * shakeAmount;
    const shakeY = (Math.random() - 0.5) * shakeAmount;
    state.boardEl.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
    shakeDuration -= 1 / 60;
    shakeRaf = requestAnimationFrame(runShake);
  } else {
    state.boardEl.style.transform = '';
    shakeRaf = null;
  }
}

let renderScheduled = false;
let lastRenderAt = 0;
function scheduleRender() {
  if (renderScheduled) return;
  if (PERF.low) {
    const now = performance.now();
    if (now - lastRenderAt < 120) return; // ~8fps on low perf
  }
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    lastRenderAt = performance.now();
    render();
  });
}

function setState(patch) {
  Object.assign(state, patch);
  scheduleRender();
}

function undoMove() {
  const prev = state.lastMove;
  if (!prev) return;
  setState({
    grid: prev.grid.map(row => row.map(cell => ({ ...cell }))),
    score: prev.score,
    progressScore: prev.progressScore,
    shapes: prev.shapes.map(s => ({ ...s, cells: s.cells.map(r => [...r]) })),
    isGameOver: false,
    isWin: false,
    clearingCells: new Set(),
    blastParticles: [],
    lastMove: null,
    movesRemaining: prev.movesRemaining,
    lastShapeTemplateIds: [...prev.lastShapeTemplateIds]
  });
}

function startLevel(level) {
  const newGrid = createEmptyGrid();
  const prefills = generatePrefill(level.prefillCount);
  prefills.forEach(({ row, col, color }) => {
    newGrid[row][col] = { filled: true, color };
  });

  const shapesSet = generateShapeSet(level.maxDifficulty, 3, state.lastShapeTemplateIds);

  setState({
    grid: newGrid,
    score: 0,
    progressScore: 0,
    shapes: shapesSet,
    currentLevel: level,
    isGameOver: false,
    isWin: false,
    isLevelComplete: false,
    clearingCells: new Set(),
    blastParticles: [],
    paused: false,
    lastMove: null,
    movesRemaining: level.moves,
    lastShapeTemplateIds: shapesSet.map(s => getShapeTemplateId(s))
  });
}
function canPlace(shape, startRow, startCol, currentGrid) {
  const g = currentGrid || state.grid;
  for (let r = 0; r < shape.cells.length; r++) {
    for (let c = 0; c < shape.cells[r].length; c++) {
      if (shape.cells[r][c]) {
        const gr = startRow + r;
        const gc = startCol + c;
        if (gr < 0 || gr >= GRID_SIZE || gc < 0 || gc >= GRID_SIZE) return false;
        if (g[gr][gc].filled) return false;
      }
    }
  }
  return true;
}

function canShapeFitAnywhere(shape, grid) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (canPlace(shape, r, c, grid)) return true;
    }
  }
  return false;
}

function placeShape(shape, startRow, startCol) {
  if (!canPlace(shape, startRow, startCol)) return false;

  // Save undo snapshot
  state.lastMove = {
    grid: state.grid.map(row => row.map(cell => ({ ...cell }))),
    score: state.score,
    progressScore: state.progressScore,
    shapes: state.shapes.map(s => ({ ...s, cells: s.cells.map(r => [...r]) })),
    isGameOver: state.isGameOver,
    isWin: state.isWin,
    movesRemaining: state.movesRemaining,
    lastShapeTemplateIds: [...state.lastShapeTemplateIds]
  };

  const newGrid = state.grid.map(row => row.map(cell => ({ ...cell, clearing: false })));
  for (let r = 0; r < shape.cells.length; r++) {
    for (let c = 0; c < shape.cells[r].length; c++) {
      if (shape.cells[r][c]) {
        newGrid[startRow + r][startCol + c] = { filled: true, color: shape.color, clearing: false };
      }
    }
  }

  playSound('place');

  const cellCount = getShapeCellCount(shape.cells);
  let newScore = state.score + cellCount; // +1 per block cell

  const rowsToClear = [];
  const colsToClear = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    if (newGrid[r].every(cell => cell.filled)) rowsToClear.push(r);
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    if (newGrid.every(row => row[c].filled)) colsToClear.push(c);
  }

  const linesCleared = rowsToClear.length + colsToClear.length;
  let progressDelta = 0;

  if (linesCleared > 0) {
    playSound('blast');
    if (!PERF.low) triggerShake();
    if (!PERF.low) triggerBlastBurst();
    const baseScore = linesCleared === 1 ? 10 : linesCleared === 2 ? 40 : linesCleared * linesCleared * 10;
    const comboBonus = linesCleared >= 3 ? (linesCleared - 2) * 20 : 0;
    const clearScore = baseScore + comboBonus;
    newScore += clearScore;
    progressDelta = clearScore;

    const clearSet = new Set();
    const particles = [];

    rowsToClear.forEach(r => {
      for (let c = 0; c < GRID_SIZE; c++) {
        clearSet.add(`${r},${c}`);
        const cellColor = newGrid[r][c].color;
        for (let p = 0; p < (PERF.low ? 1 : 3); p++) {
          particles.push({
            id: `${r}-${c}-${p}-${Math.random()}`,
            x: c,
            y: r,
            color: cellColor,
            bx: (Math.random() - 0.5) * 60,
            by: (Math.random() - 0.5) * 60
          });
        }
      }
    });

    colsToClear.forEach(c => {
      for (let r = 0; r < GRID_SIZE; r++) {
        if (!clearSet.has(`${r},${c}`)) {
          clearSet.add(`${r},${c}`);
          const cellColor = newGrid[r][c].color;
          for (let p = 0; p < (PERF.low ? 1 : 3); p++) {
            particles.push({
              id: `${r}-${c}-${p}-${Math.random()}`,
              x: c,
              y: r,
              color: cellColor,
              bx: (Math.random() - 0.5) * 60,
              by: (Math.random() - 0.5) * 60
            });
          }
        }
      }
    });

    const limitedParticles = particles.slice(0, PERF.low ? 0 : 12);
    setState({
      clearingCells: clearSet,
      blastParticles: limitedParticles,
      grid: newGrid
    });

    setTimeout(() => {
      const finalGrid = newGrid.map((row, r) =>
        row.map((cell, c) => clearSet.has(`${r},${c}`) ? { filled: false, color: '' } : cell)
      );
      setState({
        grid: finalGrid,
        clearingCells: new Set(),
        blastParticles: []
      });
    }, 450);
  } else {
    setState({ grid: newGrid });
  }

  const remainingShapes = state.shapes.filter(s => s.id !== shape.id);

  const gridToCheck = linesCleared > 0
    ? newGrid.map((row, r) =>
        row.map((cell, c) => {
          const isClear = rowsToClear.includes(r) || colsToClear.includes(c);
          return isClear ? { filled: false, color: '' } : cell;
        })
      )
    : newGrid;

  const movesRemaining = state.movesRemaining - 1;
  const progressScore = state.progressScore + progressDelta;
  setState({ score: newScore, progressScore, movesRemaining });

  const level = state.currentLevel;
  if (level && progressScore >= level.targetScore) {
    setState({ shapes: remainingShapes });
    endGame(true);
    return true;
  }

  const nextShapes = remainingShapes.length === 0
    ? generateShapeSet(state.currentLevel ? state.currentLevel.maxDifficulty : 1, 3, state.lastShapeTemplateIds)
    : remainingShapes;

  const anyCanFit = nextShapes.some(s => canShapeFitAnywhere(s, gridToCheck));
  if (movesRemaining <= 0 || !anyCanFit) {
    setState({ shapes: nextShapes });
    endGame(false);
    return true;
  }

  const newTemplateIds = nextShapes.map(s => getShapeTemplateId(s));
  setState({ shapes: nextShapes, lastShapeTemplateIds: newTemplateIds });
  return true;
}

function getStars() {
  if (!state.currentLevel) return 0;
  const [s1, s2, s3] = state.currentLevel.starThresholds;
  if (state.progressScore >= s3) return 3;
  if (state.progressScore >= s2) return 2;
  if (state.progressScore >= s1) return 1;
  return 0;
}

function getStarsForScore(score, levelConfig) {
  const [s1, s2, s3] = levelConfig.starThresholds;
  if (score >= s3) return 3;
  if (score >= s2) return 2;
  if (score >= s1) return 1;
  return 0;
}

function endGame(forcedWin) {
  const level = state.currentLevel;
  if (!level) return;
  const isWin = typeof forcedWin === 'boolean' ? forcedWin : state.progressScore >= level.targetScore;
  const bestScore = state.levelBestScores[level.level] || 0;
  if (state.score > bestScore) {
    state.levelBestScores[level.level] = state.score;
  }
  const bestProgress = state.levelBestProgress?.[level.level] || 0;
  if (!state.levelBestProgress) state.levelBestProgress = {};
  if (state.progressScore > bestProgress) {
    state.levelBestProgress[level.level] = state.progressScore;
  }
  if (isWin && level.level >= state.unlockedLevel) {
    state.unlockedLevel = level.level + 1;
  }
  playSound(isWin ? 'win' : 'lose');
  saveProgress();
  const delay = isWin ? 1400 : 600;
  setTimeout(() => {
    setState({ isGameOver: true, isWin });
  }, delay);
}
function startLoading() {
  if (state.loadingInterval) return;
  state.loadingInterval = setInterval(() => {
    state.loadingProgress = Math.min(state.loadingProgress + 1.5, 100);
    scheduleRender();
    if (state.loadingProgress >= 100) {
      clearInterval(state.loadingInterval);
      state.loadingInterval = null;
      setTimeout(() => setState({ screen: 'levelSelect' }), 400);
    }
  }, 30);
}

function render3DBlock(color, size, clearing) {
  const hue = color.split(' ')[0];
  const gloss = asset(ASSETS.blockGloss);
  return {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '4px',
    backgroundImage: clearing
      ? 'none'
      : `linear-gradient(145deg, hsl(${color}) 0%, hsl(${hue} ${color.split(' ')[1]} ${Math.max(parseInt(color.split(' ')[2]) - 15, 15)}%) 100%), url('${gloss}')`,
    backgroundColor: clearing ? 'hsl(45 100% 80%)' : 'transparent',
    backgroundSize: 'cover, cover',
    backgroundPosition: 'center, center',
    backgroundRepeat: 'no-repeat, no-repeat',
    boxShadow: clearing
      ? '0 0 12px hsla(45 100% 60% / 0.8), 0 0 24px hsla(45 100% 60% / 0.4)'
      : 'inset 0 2px 3px hsla(0 0% 100% / 0.3), inset 0 -2px 3px hsla(0 0% 0% / 0.25), 0 2px 4px hsla(0 0% 0% / 0.2)',
    transform: clearing ? 'scale(1.1)' : 'scale(1)',
    transition: 'all 0.3s ease-out'
  };
}

function getGridPos(clientX, clientY) {
  if (!state.boardEl) return null;
  const rect = state.boardEl.getBoundingClientRect();
  const padding = 6;
  const gapTotal = GRID_SIZE - 1;
  const innerWidth = rect.width - padding * 2;
  const actualCellSize = (innerWidth - gapTotal) / GRID_SIZE;
  const x = clientX - rect.left - padding;
  const y = clientY - rect.top - padding;
  const col = Math.floor(x / (actualCellSize + 1));
  const row = Math.floor(y / (actualCellSize + 1));
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null;
  return { row, col };
}

function setupPointerHandlers() {
  if (setupPointerHandlers.done) return;
  setupPointerHandlers.done = true;

  const endDrag = () => {
    const shape = state.draggingShape;
    if (!shape) return;
    const gPos = state.ghostPos;
    if (gPos && canPlace(shape, gPos.row, gPos.col)) {
      placeShape(shape, gPos.row, gPos.col);
    }
    state.draggingShape = null;
    state.dragPos = null;
    state.ghostPos = null;
    lastPointer = null;
    if (dragRaf) {
      cancelAnimationFrame(dragRaf);
      dragRaf = null;
    }
    unmountDragLayer();
    scheduleRender();
  };

  window.addEventListener('pointermove', e => {
    const shape = state.draggingShape;
    if (!shape) return;
    lastPointer = { x: e.clientX, y: e.clientY };
    if (!dragRaf) dragRaf = requestAnimationFrame(updateDragFrame);
  });

  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('blur', endDrag);
}

function isGhostCell(row, col) {
  const shape = state.draggingShape;
  const gPos = state.ghostPos;
  if (!shape || !gPos) return false;
  const sr = row - gPos.row;
  const sc = col - gPos.col;
  if (sr < 0 || sr >= shape.cells.length) return false;
  if (sc < 0 || sc >= shape.cells[0].length) return false;
  return shape.cells[sr][sc] === 1;
}

function createEl(tag, className, style) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (style) Object.assign(el.style, style);
  return el;
}

function drawBoardCanvas() {
  if (!state.boardEl || !state.boardCanvas) return;
  const canvas = state.boardCanvas;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const padding = 6;
  const rect = state.boardEl.getBoundingClientRect();
  const size = Math.floor(rect.width - padding * 2);
  if (size <= 0) return;

  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size;
    canvas.height = size;
  }

  const gap = 1;
  const cellSize = Math.floor((size - (GRID_SIZE - 1) * gap) / GRID_SIZE);
  state.cellSize = cellSize;

  ctx.clearRect(0, 0, size, size);

  const showGhost = state.draggingShape && state.ghostPos;
  const gPos = state.ghostPos;
  const ghostValid = showGhost && canPlace(state.draggingShape, gPos.row, gPos.col);

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const x = c * (cellSize + gap);
      const y = r * (cellSize + gap);
      const cell = state.grid[r][c];
      const clearing = state.clearingCells.has(`${r},${c}`);
      const ghost = showGhost && isGhostCell(r, c);

      if (cell.filled) {
        const hue = cell.color.split(' ')[0];
        const s = cell.color.split(' ')[1];
        const l = cell.color.split(' ')[2];
        const grad = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
        grad.addColorStop(0, `hsl(${hue} ${s} ${Math.min(parseInt(l) + 10, 75)}%)`);
        grad.addColorStop(0.5, `hsl(${cell.color})`);
        grad.addColorStop(1, `hsl(${hue} ${s} ${Math.max(parseInt(l) - 18, 12)}%)`);
        ctx.fillStyle = clearing ? 'hsl(45 100% 80%)' : grad;
        ctx.fillRect(x, y, cellSize, cellSize);

        // subtle bevel highlight
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.moveTo(x + 1, y + 1);
        ctx.lineTo(x + cellSize - 2, y + 1);
        ctx.lineTo(x + cellSize - 6, y + 6);
        ctx.lineTo(x + 4, y + 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // bottom shadow edge
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.moveTo(x + 3, y + cellSize - 3);
        ctx.lineTo(x + cellSize - 3, y + cellSize - 3);
        ctx.lineTo(x + cellSize - 6, y + cellSize - 6);
        ctx.lineTo(x + 6, y + cellSize - 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (ghost && ghostValid) {
        const color = state.draggingShape.color;
        ctx.fillStyle = `hsla(${color} / 0.5)`;
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeStyle = `hsla(${color} / 0.85)`;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      } else if (showGhost && !ghostValid && gPos && r === gPos.row && c === gPos.col) {
        // Invalid drop: show a small red indicator instead of partial ghost.
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 80, 80, 0.9)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 6);
        ctx.lineTo(x + cellSize - 6, y + cellSize - 6);
        ctx.moveTo(x + cellSize - 6, y + 6);
        ctx.lineTo(x + 6, y + cellSize - 6);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = '#131b25';
        ctx.fillRect(x, y, cellSize, cellSize);
      }

      // gold-ish grid stroke
      ctx.strokeStyle = 'rgba(214, 183, 106, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
    }
  }
}

function setButtonContent(button, iconClass, label) {
  const icon = createEl('i', iconClass);
  const text = createEl('span');
  text.textContent = label;
  button.appendChild(icon);
  button.appendChild(text);
}

function triggerBlastBurst() {
  if (PERF.low) return;
  if (!state.boardEl) return;
  const layer = createEl('div', 'blast-layer');
  const count = 20;
  const width = state.boardEl.clientWidth;
  const height = state.boardEl.clientHeight;

  for (let i = 0; i < count; i++) {
    const sprite = createEl('div', 'blast-fall');
    const sideLeft = i % 2 === 0;
    const startX = sideLeft
      ? Math.random() * width * 0.35
      : width * (0.65 + Math.random() * 0.35);
    const dx = (sideLeft ? 40 : -40) + (Math.random() - 0.5) * 60;
    const dy = height * 0.9 + Math.random() * 120;
    const rot = Math.random() * 140 - 70;
    const scale = 0.5 + Math.random() * 0.6;
    const dur = 1.2 + Math.random() * 0.8;
    const delay = Math.random() * 0.15;

    sprite.style.left = `${startX}px`;
    sprite.style.top = `-20px`;
    sprite.style.setProperty('--dx', `${dx}px`);
    sprite.style.setProperty('--dy', `${dy}px`);
    sprite.style.setProperty('--r', `${rot}deg`);
    sprite.style.setProperty('--s', `${scale}`);
    sprite.style.setProperty('--d', `${dur}s`);
    sprite.style.animationDelay = `${delay}s`;
    sprite.style.backgroundImage = `url('${asset(ASSETS.blastParticles)}')`;
    layer.appendChild(sprite);
  }

  state.boardEl.appendChild(layer);
  setTimeout(() => layer.remove(), 2400);
}

function renderStarImg(filled, size) {
  const img = createEl('img');
  img.src = asset(filled ? ASSETS.starFill : ASSETS.starEmpty);
  img.width = size;
  img.height = size;
  img.style.display = 'block';
  img.style.filter = filled ? 'drop-shadow(0 2px 6px hsla(45 93% 50% / 0.45))' : 'none';
  return img;
}

function renderLockImg(size) {
  const img = createEl('img');
  img.src = asset(ASSETS.lock);
  img.width = size;
  img.height = size;
  img.style.display = 'block';
  return img;
}
function renderLoading() {
  startLoading();
  const container = createEl('div', 'fixed inset-0 flex flex-col items-center justify-center overflow-hidden screen-loading');

  const ambient = createEl('div', 'absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20', {
    background: 'radial-gradient(circle, hsl(200 80% 50%), transparent 70%)'
  });

  const stack = createEl('div', 'relative z-10 flex flex-col items-center gap-10');

  const blocks = createEl('div', 'flex gap-3');
  const blockDefs = [
    { color: '340 82% 52%', delay: 0 },
    { color: '25 95% 53%', delay: 0.12 },
    { color: '45 93% 48%', delay: 0.24 },
    { color: '200 80% 48%', delay: 0.36 },
    { color: '262 70% 55%', delay: 0.48 }
  ];
  blockDefs.forEach(def => {
    const wrapper = createEl('div', 'relative');
    wrapper.style.animation = `blockFloat 1.2s ease-in-out ${def.delay}s infinite`;
    const block = createEl('div', 'w-8 h-8 md:w-10 md:h-10 rounded-lg', {
      background: `linear-gradient(135deg, hsl(${def.color}) 0%, hsl(${def.color.split(' ')[0]} ${def.color.split(' ')[1]} 35%) 100%)`,
      boxShadow: `inset 0 2px 4px hsla(0 0% 100% / 0.3), inset 0 -3px 4px hsla(0 0% 0% / 0.2), 0 6px 16px hsla(${def.color.split(' ')[0]} 60% 30% / 0.5), 0 2px 4px hsla(0 0% 0% / 0.3)`
    });
    wrapper.appendChild(block);
    blocks.appendChild(wrapper);
  });

  const progressWrap = createEl('div', 'w-72 md:w-80');
  const bar = createEl('div', 'flex gap-1 p-2 rounded-xl', {
    background: 'linear-gradient(180deg, hsl(220 25% 10%), hsl(220 25% 14%))',
    boxShadow: 'inset 0 2px 6px hsla(0 0% 0% / 0.5), 0 1px 0 hsla(0 0% 100% / 0.05)'
  });

  const segments = 20;
  const filledSegments = Math.floor((state.loadingProgress / 100) * segments);
  for (let i = 0; i < segments; i++) {
    const seg = createEl('div', 'flex-1 h-4 rounded-md transition-all duration-200', {
      background: i < filledSegments
        ? `linear-gradient(180deg, hsl(${140 + i * 6} 70% 55%), hsl(${140 + i * 6} 70% 38%))`
        : 'hsl(220 20% 18%)',
      boxShadow: i < filledSegments
        ? `inset 0 1px 2px hsla(0 0% 100% / 0.25), 0 0 8px hsla(${140 + i * 6} 70% 50% / 0.3)`
        : 'inset 0 1px 3px hsla(0 0% 0% / 0.3)',
      transform: i < filledSegments ? 'scaleY(1)' : 'scaleY(0.85)'
    });
    bar.appendChild(seg);
  }

  const percent = createEl('p', 'text-center text-sm font-bold mt-3 tabular-nums', {
    color: 'hsl(210 20% 55%)'
  });
  percent.textContent = `${Math.round(state.loadingProgress)}%`;

  progressWrap.appendChild(bar);
  progressWrap.appendChild(percent);

  stack.appendChild(blocks);
  stack.appendChild(progressWrap);

  container.appendChild(ambient);
  container.appendChild(stack);
  root.appendChild(container);
}

function renderLevelSelect() {
  const container = createEl('div', 'fixed inset-0 flex flex-col overflow-auto screen-levels');

  const inner = createEl('div', 'p-6 md:p-10 max-w-xl mx-auto w-full levels-panel');

  const title = createEl('h1', 'text-3xl md:text-4xl font-black text-center mb-1 tracking-tight', {
    background: 'linear-gradient(180deg, hsl(45 95% 70%), hsl(25 90% 55%))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 2px 4px hsla(0 0% 0% / 0.4))'
  });
  title.textContent = 'Select Level';

  const subtitle = createEl('p', 'text-center text-xs font-semibold tracking-wider uppercase mb-8', {
    color: 'hsl(210 20% 50%)'
  });
  subtitle.textContent = 'Complete levels to unlock more';

  const grid = createEl('div', 'grid grid-cols-4 sm:grid-cols-5 gap-3 levels-grid');

  for (let i = 0; i < 20; i++) {
    const level = i + 1;
    const isUnlocked = level <= state.unlockedLevel;
    const bestScore = state.levelBestScores[level] || 0;
    const bestProgress = state.levelBestProgress?.[level] || 0;
    const stars = bestProgress > 0 ? getStarsForScore(bestProgress, LEVELS[level - 1]) : 0;
    const hueMap = { 1: '142 55%', 2: '45 80%', 3: '25 85%', 4: '340 75%' };
    const tier = level <= 5 ? 1 : level <= 10 ? 2 : level <= 15 ? 3 : 4;
    const hue = hueMap[tier];

    const btn = createEl('button', 'relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed level-btn');
    btn.disabled = !isUnlocked;
    if (!isUnlocked) btn.classList.add('is-locked');

    if (isUnlocked) {
      const num = createEl('span', 'text-xl font-black level-num');
      num.textContent = `${level}`;
      const starsWrap = createEl('div', 'flex gap-0.5 level-stars');
      [1, 2, 3].forEach(s => {
        const star = renderStarImg(s <= stars, 18);
        starsWrap.appendChild(star);
      });
      const best = createEl('div', 'level-best');
      best.textContent = `Best ${bestScore}`;
      btn.appendChild(num);
      btn.appendChild(starsWrap);
      btn.appendChild(best);
    } else {
      const lock = renderLockImg(34);
      btn.appendChild(lock);
    }

    btn.addEventListener('click', () => {
      if (!isUnlocked) return;
      const levelConfig = LEVELS[level - 1];
      startLevel(levelConfig);
      setState({ screen: 'game', paused: false });
    });

    grid.appendChild(btn);
  }

  inner.appendChild(title);
  inner.appendChild(subtitle);
  inner.appendChild(grid);
  container.appendChild(inner);
  root.appendChild(container);
}

function renderTopBar() {
  const wrap = createEl('div', 'scorebar px-4 py-3');
  const left = createEl('div', 'scorebar-left');
  const right = createEl('div', 'scorebar-right');
  const levelTag = createEl('span', 'text-sm font-black px-3 py-1.5 rounded-xl', {
    background: 'linear-gradient(145deg, hsl(262 60% 35%), hsl(262 60% 25%))',
    color: 'hsl(262 70% 85%)',
    boxShadow: 'inset 0 1px 2px hsla(0 0% 100% / 0.15), 0 2px 6px hsla(0 0% 0% / 0.3)'
  });
  levelTag.textContent = `Lv.${state.currentLevel.level}`;

  const scoreTag = createEl('span', 'text-xs font-black px-3 py-1.5 rounded-xl score-tag');
  scoreTag.textContent = `Score ${state.score}`;

  const movesTag = createEl('span', 'text-xs font-black px-3 py-1.5 rounded-xl moves-tag');
  movesTag.textContent = `Moves ${state.movesRemaining}`;

  const undoBtn = createEl('button', 'icon-btn');
  undoBtn.disabled = !state.lastMove;
  undoBtn.title = 'Undo';
  undoBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
  undoBtn.addEventListener('click', () => undoMove());

  const pauseBtn = createEl('button', 'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-90', {
    background: 'linear-gradient(145deg, hsl(220 20% 25%), hsl(220 20% 18%))',
    boxShadow: 'inset 0 1px 2px hsla(0 0% 100% / 0.1), 0 2px 6px hsla(0 0% 0% / 0.3)',
    color: 'hsl(210 20% 60%)'
  });
  const pauseIcon = createEl('img');
  pauseIcon.src = asset(ASSETS.pause);
  pauseIcon.width = 30;
  pauseIcon.height = 30;
  pauseIcon.style.display = 'block';
  pauseBtn.appendChild(pauseIcon);
  pauseBtn.addEventListener('click', () => setState({ paused: true }));

  left.appendChild(levelTag);
  left.appendChild(scoreTag);
  left.appendChild(movesTag);
  right.appendChild(undoBtn);
  right.appendChild(pauseBtn);
  wrap.appendChild(left);
  wrap.appendChild(right);
  return wrap;
}

function renderProgressBarOnly() {
  const progressWrap = createEl('div', 'scorebar-progress px-2');
  const progressHeader = createEl('div', 'flex justify-between text-xs font-bold mb-1', { color: 'hsl(210 20% 55%)' });
  const scoreText = createEl('span');
  scoreText.textContent = `${state.progressScore}`;
  const targetText = createEl('span');
  targetText.textContent = `${state.currentLevel.targetScore}`;
  progressHeader.appendChild(scoreText);
  progressHeader.appendChild(targetText);

  const progressBar = createEl('div', 'h-3 rounded-lg overflow-hidden', {
    background: 'linear-gradient(180deg, hsl(220 25% 12%), hsl(220 25% 16%))',
    boxShadow: 'inset 0 2px 4px hsla(0 0% 0% / 0.4)'
  });
  const progress = Math.min((state.progressScore / state.currentLevel.targetScore) * 100, 100);
  const progressFill = createEl('div', 'h-full rounded-lg transition-all duration-500 ease-out', {
    width: `${progress}%`,
    background: 'linear-gradient(180deg, hsl(142 60% 50%), hsl(142 60% 35%))',
    boxShadow: 'inset 0 1px 2px hsla(0 0% 100% / 0.25), 0 0 10px hsla(142 60% 50% / 0.3)'
  });
  progressBar.appendChild(progressFill);

  progressWrap.appendChild(progressHeader);
  progressWrap.appendChild(progressBar);
  return progressWrap;
}
function renderGameBoard() {
  const container = createEl('div', 'flex flex-col items-center gap-5 w-full max-w-[420px] mx-auto');

  const board = createEl('div', 'rounded-2xl w-full aspect-square relative board-surface', {
    padding: '6px',
    boxShadow: 'inset 0 3px 8px hsla(0 0% 0% / 0.5), inset 0 -1px 2px hsla(0 0% 100% / 0.05), 0 8px 32px hsla(0 0% 0% / 0.4), 0 2px 8px hsla(0 0% 0% / 0.3)',
    border: '1px solid hsla(0 0% 100% / 0.05)'
  });
  state.boardEl = board;

  const canvas = createEl('canvas', 'board-canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  board.appendChild(canvas);
  state.boardCanvas = canvas;

  if (!PERF.low) state.blastParticles.forEach(particle => {
    const dot = createEl('div', 'absolute pointer-events-none');
    dot.style.left = `${particle.x * (state.cellSize + 1) + 6 + state.cellSize / 2}px`;
    dot.style.top = `${particle.y * (state.cellSize + 1) + 6 + state.cellSize / 2}px`;
    dot.style.width = '26px';
    dot.style.height = '26px';
    dot.style.marginLeft = '-11px';
    dot.style.marginTop = '-11px';
    dot.style.backgroundImage = `url('${asset(ASSETS.blastParticles)}')`;
    dot.style.backgroundSize = 'contain';
    dot.style.backgroundRepeat = 'no-repeat';
    dot.style.backgroundPosition = 'center';
    dot.style.filter = particle.color ? `drop-shadow(0 0 6px hsla(${particle.color} / 0.6))` : 'drop-shadow(0 0 6px hsla(45 90% 60% / 0.6))';
    dot.style.animation = 'blastParticle 0.5s ease-out forwards';
    dot.style.setProperty('--bx', `${particle.bx}px`);
    dot.style.setProperty('--by', `${particle.by}px`);
    board.appendChild(dot);
  });

  const tray = createEl('div', 'flex items-center justify-center gap-5 md:gap-7 p-4 rounded-2xl w-full', {
    background: 'linear-gradient(145deg, hsl(220 25% 18%), hsl(220 25% 13%))',
    boxShadow: 'inset 0 1px 2px hsla(0 0% 100% / 0.06), 0 4px 16px hsla(0 0% 0% / 0.3)',
    border: '1px solid hsla(0 0% 100% / 0.04)',
    minHeight: '80px'
  });

  const pieceScale = TRAY_SCALE;
  const displaySize = state.cellSize * pieceScale;

  state.shapes.forEach(shape => {
    const isBeingDragged = state.draggingShape && state.draggingShape.id === shape.id;
    const shapeWrap = createEl('div', 'touch-none select-none', {
      cursor: 'grab',
      touchAction: 'none',
      opacity: isBeingDragged ? '0.3' : '1',
      transform: isBeingDragged ? 'scale(0.8)' : 'scale(1)',
      transition: 'opacity 0.15s, transform 0.15s',
      padding: '4px'
    });

    shapeWrap.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      const rect = shapeWrap.getBoundingClientRect();
      const grabOffsetX = e.clientX - rect.left;
      const grabOffsetY = e.clientY - rect.top;
      const previewStep = displaySize + 2;
      const fullStep = state.cellSize + 2;
      const scale = fullStep / previewStep;
      state.draggingShape = shape;
      state.dragPos = { x: e.clientX, y: e.clientY };
      lastPointer = { x: e.clientX, y: e.clientY };
      mountDragLayer(shape, {
        grabX: grabOffsetX * scale,
        grabY: grabOffsetY * scale
      });
      if (!dragRaf) dragRaf = requestAnimationFrame(updateDragFrame);
      scheduleRender();
    });

    const shapeGrid = createEl('div', 'flex flex-col gap-[2px]');
    shape.cells.forEach(row => {
      const rowEl = createEl('div', 'flex gap-[2px]');
      row.forEach(cell => {
        const cellEl = createEl('div');
        if (cell) {
          cellEl.style.width = `${displaySize}px`;
          cellEl.style.height = `${displaySize}px`;
          cellEl.style.borderRadius = '3px';
          cellEl.style.backgroundImage = `linear-gradient(145deg, hsl(${shape.color}) 0%, hsl(${shape.color.split(' ')[0]} ${shape.color.split(' ')[1]} ${Math.max(parseInt(shape.color.split(' ')[2]) - 12, 15)}%) 100%), url('${asset(ASSETS.blockGloss)}')`;
          cellEl.style.backgroundSize = 'cover, cover';
          cellEl.style.backgroundPosition = 'center, center';
          cellEl.style.backgroundRepeat = 'no-repeat, no-repeat';
          cellEl.style.boxShadow = 'inset 0 1px 2px hsla(0 0% 100% / 0.3), inset 0 -1px 2px hsla(0 0% 0% / 0.2), 0 1px 3px hsla(0 0% 0% / 0.3)';
        } else {
          cellEl.style.width = `${displaySize}px`;
          cellEl.style.height = `${displaySize}px`;
        }
        rowEl.appendChild(cellEl);
      });
      shapeGrid.appendChild(rowEl);
    });

    shapeWrap.appendChild(shapeGrid);
    tray.appendChild(shapeWrap);
  });

  container.appendChild(board);
  container.appendChild(tray);

  drawBoardCanvas();
  return container;
}
function renderPauseMenu() {
  const overlay = createEl('div', 'fixed inset-0 z-50 flex items-center justify-center', {
    backgroundColor: 'hsla(220, 30%, 5%, 0.7)',
    backdropFilter: 'blur(12px)'
  });

  const card = createEl('div', 'rounded-3xl p-8 flex flex-col items-center gap-5 w-72 ui-panel modal-card', {
    boxShadow: '0 20px 60px hsla(0 0% 0% / 0.6), inset 0 1px 2px hsla(0 0% 100% / 0.08)',
    border: '1px solid hsla(0 0% 100% / 0.06)',
    animation: 'scaleIn 0.25s ease-out'
  });

  const title = createEl('h2', 'text-2xl font-black', { color: 'hsl(0 0% 92%)' });
  title.textContent = 'Paused';
  card.appendChild(title);

  const buttons = [
    { label: 'Resume', icon: 'fa-solid fa-play', action: () => setState({ paused: false }), className: 'game-btn game-btn-primary' },
    { label: 'Restart', icon: 'fa-solid fa-rotate-right', action: () => state.currentLevel && startLevel(state.currentLevel), className: 'game-btn game-btn-secondary' },
    { label: 'Exit', icon: 'fa-solid fa-door-open', action: () => setState({ paused: false, screen: 'levelSelect' }), className: 'game-btn game-btn-danger' }
  ];

  buttons.forEach(btn => {
    const b = createEl('button', btn.className);
    setButtonContent(b, btn.icon, btn.label);
    b.addEventListener('click', btn.action);
    card.appendChild(b);
  });

  overlay.appendChild(card);
  return overlay;
}

function renderLevelComplete() {
  const overlay = createEl('div', 'fixed inset-0 z-50 flex items-center justify-center', {
    backgroundColor: 'hsla(220, 30%, 5%, 0.7)',
    backdropFilter: 'blur(12px)'
  });

  const card = createEl('div', 'rounded-3xl p-8 flex flex-col items-center gap-5 w-80 ui-panel modal-card', {
    boxShadow: '0 20px 60px hsla(0 0% 0% / 0.6), inset 0 1px 2px hsla(0 0% 100% / 0.08)',
    border: '1px solid hsla(0 0% 100% / 0.06)',
    animation: 'scaleIn 0.3s ease-out'
  });

  const statusImg = createEl('img', 'modal-status-img');
  statusImg.src = asset(state.isWin ? ASSETS.win : ASSETS.lose);
  statusImg.alt = state.isWin ? 'Win' : 'Lose';

  const title = createEl('h2', 'text-2xl font-black', {
    background: state.isWin
      ? 'linear-gradient(180deg, hsl(45 95% 70%), hsl(25 90% 55%))'
      : 'linear-gradient(180deg, hsl(0 80% 65%), hsl(0 70% 45%))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  });
  title.textContent = state.isWin
    ? `Level ${state.currentLevel.level} Complete!`
    : `Level ${state.currentLevel.level} Failed`;

  const starsWrap = createEl('div', 'flex gap-4');
  const stars = state.isWin ? getStars() : 0;
  [1, 2, 3].forEach(s => {
    const starBox = createEl('div');
    if (s <= stars) starBox.style.animation = `starPop 0.4s ease-out ${s * 0.2}s both`;
    const star = renderStarImg(s <= stars, 76);
    starBox.appendChild(star);
    starsWrap.appendChild(starBox);
  });

  const scoreWrap = createEl('div', 'text-center');
  const scoreLabel = createEl('div', 'text-xs font-semibold uppercase tracking-wider', { color: 'hsl(210 20% 50%)' });
  scoreLabel.textContent = 'Total Score';
  const scoreValue = createEl('div', 'text-4xl font-black', { color: 'hsl(0 0% 95%)' });
  scoreValue.textContent = `${state.score}`;
  const target = createEl('div', 'text-xs font-semibold uppercase tracking-wider mt-1', { color: 'hsl(210 20% 50%)' });
  target.textContent = `Target ${state.currentLevel.targetScore}`;
  scoreWrap.appendChild(scoreLabel);
  scoreWrap.appendChild(scoreValue);
  scoreWrap.appendChild(target);

  const btnWrap = createEl('div', 'flex flex-col gap-3 w-full');
  const isLastLevel = state.currentLevel.level === 20;

  if (state.isWin && !isLastLevel) {
    const nextBtn = createEl('button', 'game-btn game-btn-primary');
    setButtonContent(nextBtn, 'fa-solid fa-forward', 'Next Level');
    nextBtn.addEventListener('click', () => {
      const next = LEVELS[state.currentLevel.level];
      if (next) startLevel(next);
      else setState({ screen: 'levelSelect' });
    });
    btnWrap.appendChild(nextBtn);
  }

  const replayBtn = createEl('button', 'game-btn game-btn-secondary');
  setButtonContent(replayBtn, 'fa-solid fa-rotate-left', state.isWin ? 'Replay' : 'Try Again');
  replayBtn.addEventListener('click', () => {
    startLevel(state.currentLevel);
  });
  btnWrap.appendChild(replayBtn);

  const exitBtn = createEl('button', 'game-btn game-btn-secondary');
  setButtonContent(exitBtn, 'fa-solid fa-door-open', 'Back to Levels');
  exitBtn.addEventListener('click', () => setState({ screen: 'levelSelect' }));
  btnWrap.appendChild(exitBtn);

  card.appendChild(statusImg);
  card.appendChild(title);
  card.appendChild(starsWrap);
  card.appendChild(scoreWrap);
  card.appendChild(btnWrap);
  overlay.appendChild(card);
  return overlay;
}

function renderGameOver() {
  const overlay = createEl('div', 'fixed inset-0 z-50 flex items-center justify-center', {
    backgroundColor: 'hsla(220, 30%, 5%, 0.7)',
    backdropFilter: 'blur(12px)'
  });

  const card = createEl('div', 'rounded-3xl p-8 flex flex-col items-center gap-5 w-72 ui-panel modal-card', {
    boxShadow: '0 20px 60px hsla(0 0% 0% / 0.6), inset 0 1px 2px hsla(0 0% 100% / 0.08)',
    border: '1px solid hsla(0 0% 100% / 0.06)',
    animation: 'scaleIn 0.3s ease-out'
  });

  const title = createEl('h2', 'text-2xl font-black', { color: 'hsl(0 70% 60%)' });
  title.textContent = 'Game Over';

  const scoreWrap = createEl('div', 'text-center');
  const label = createEl('div', 'text-xs font-semibold uppercase tracking-wider', { color: 'hsl(210 20% 50%)' });
  label.textContent = 'Score';
  const value = createEl('div', 'text-3xl font-black', { color: 'hsl(0 0% 95%)' });
  value.textContent = `${state.score}`;
  scoreWrap.appendChild(label);
  scoreWrap.appendChild(value);

  const tryAgain = createEl('button', 'game-btn game-btn-primary');
  setButtonContent(tryAgain, 'fa-solid fa-rotate-right', 'Try Again');
  tryAgain.addEventListener('click', () => {
    setState({ isGameOver: false });
    if (state.currentLevel) startLevel(state.currentLevel);
  });

  const exit = createEl('button', 'game-btn game-btn-secondary');
  setButtonContent(exit, 'fa-solid fa-door-open', 'Exit');
  exit.addEventListener('click', () => setState({ screen: 'levelSelect', isGameOver: false }));

  card.appendChild(title);
  card.appendChild(scoreWrap);
  card.appendChild(tryAgain);
  card.appendChild(exit);
  overlay.appendChild(card);
  return overlay;
}

function renderGame() {
  const container = createEl('div', 'fixed inset-0 flex flex-col screen-game');

  if (state.currentLevel) {
    container.appendChild(renderTopBar());
  }

  const boardWrap = createEl('div', 'flex-1 flex items-center justify-center px-4 pb-4');
  const boardStack = createEl('div', 'w-full max-w-[420px] mx-auto flex flex-col gap-3');
  if (state.currentLevel) {
    boardStack.appendChild(renderProgressBarOnly());
  }
  boardStack.appendChild(renderGameBoard());
  boardWrap.appendChild(boardStack);
  container.appendChild(boardWrap);

  if (state.paused) container.appendChild(renderPauseMenu());
  if (state.isGameOver && state.currentLevel) container.appendChild(renderLevelComplete());

  root.appendChild(container);

  requestAnimationFrame(() => {
    if (!state.boardEl) return;
    const width = state.boardEl.clientWidth;
    const nextCellSize = Math.floor((width - GRID_SIZE - 1) / GRID_SIZE);
    if (nextCellSize > 0 && nextCellSize !== state.cellSize) {
      state.cellSize = nextCellSize;
      drawBoardCanvas();
    }
  });
}

function render() {
  if (!root) return;
  root.innerHTML = '';
  setupPointerHandlers();

  if (state.screen === 'loading') {
    renderLoading();
    return;
  }

  if (state.screen === 'levelSelect') {
    renderLevelSelect();
    return;
  }

  renderGame();
  drawBoardCanvas();
}

render();
