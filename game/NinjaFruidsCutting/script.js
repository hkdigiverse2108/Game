// ========== FRUIT SLICE ARCADE - COMPLETE WITH UI STATES ==========
(function() {
  const ASSET_BASE = new URL("images/", window.location.href).href;
  const SFX_BASE = new URL("audio/", window.location.href).href;
  const assetUrl = (file) => `${ASSET_BASE}${file}`;
  const sfxUrl = (file) => `${SFX_BASE}${file}`;

  // ---------- FRUIT DATABASE ----------
  const fruitTypes = [
    { name: "apple", src: assetUrl("apple.png"), radius: 38, points: 10, color: "#e31b23" },
    { name: "banana", src: assetUrl("banana.png"), radius: 46, points: 10, color: "#ffe135" },
    { name: "kiwi", src: assetUrl("kiwi.png"), radius: 34, points: 10, color: "#8cc63f" },
    { name: "mango", src: assetUrl("mongo.png"), radius: 54, points: 10, color: "#ffb347" },
    { name: "orange", src: assetUrl("orange.png"), radius: 36, points: 10, color: "#ff9c2a" },
    { name: "stawberry", src: assetUrl("stawberry.png"), radius: 32, points: 10, color: "#fc4a6c" },
    { name: "watermelon", src: assetUrl("watermelon.png"), radius: 42, points: 15, color: "#3c9e3c" }
  ];

  const splashMap = {
    apple: assetUrl("applesplash.png"),
    banana: assetUrl("bananasplash.png"),
    kiwi: assetUrl("kiwisplash.png"),
    mango: assetUrl("mangoSplash.png"),
    orange: assetUrl("commonSplash.png"),
    stawberry: assetUrl("stawberrysplash.png"),
    watermelon: assetUrl("watermelonSplash.png"),
    bomb: assetUrl("bombsplash.png")
  };
  const DEFAULT_SPLASH = assetUrl("commonSplash.png");

  // Physics constants
  const GRAVITY = 1250;
  const BASE_VY = -720;

  // DOM Elements
  const canvas = document.getElementById('gameCanvas');
  const effectCanvas = document.getElementById('effectCanvas');
  let ctx = canvas.getContext('2d');
  let effectCtx = effectCanvas.getContext('2d');
  const scoreSpan = document.getElementById('scoreValue');
  const livesSpan = document.getElementById('livesValue');
  const comboValueSpan = document.getElementById('comboValue');
  const startScreen = document.getElementById('startScreen');
  const loadingScreen = document.getElementById('loadingScreen');
  const countdownScreen = document.getElementById('countdownScreen');
  const gameOverlay = document.getElementById('gameOverlay');
  const startBtn = document.getElementById('startButton');
  const restartGameBtn = document.getElementById('restartGameBtn');
  const finalScoreSpan = document.getElementById('finalScoreSpan');
  const finalComboSpan = document.getElementById('finalComboSpan');
  const finalFruitsSpan = document.getElementById('finalFruitsSpan');
  const progressBar = document.getElementById('progressBar');
  const gameContainer = document.querySelector('.game-container');
  const pauseBtn = document.getElementById('pauseBtn');
  const pauseScreen = document.getElementById('pauseScreen');
  const resumeBtn = document.getElementById('resumeBtn');
  const restartBtn = document.getElementById('restartBtn');
  const exitBtn = document.getElementById('exitBtn');

  // Game state
  let assets = {};
  let splashImages = {};
  let fruits = [];
  let fruitPieces = [];
  let splashes = [];
  let particles = [];
  let trailPoints = [];
  let gameRunning = false;
  let score = 0;
  let lives = 5;
  let totalSliced = 0;
  let lastTimestamp = 0;
  let lastSpawnTime = 0;
  let spawnDelay = 900;
  let gameStartTime = 0;
  let nextBombTime = 0;
  let currentCombo = 0;
  let bestCombo = 0;
  let comboTimeout = null;
  let difficultyLevel = 1;
  let isPaused = false;
  let bombAnimating = false;
  let bombBlast = null;

  // Screen shake
  let shakeAmount = 0;
  let shakeDuration = 0;

  // Audio
  let audioCtx = null;
  let soundEnabled = true;
  let bgmOscillator = null;
  let bgmGain = null;
  const sliceSfx = new Audio(sfxUrl("fruits.wav"));
  const bombSfx = new Audio(sfxUrl("bomb.wav"));
  sliceSfx.volume = 0.7;
  bombSfx.volume = 0.8;

  // Canvas dimensions
  let boardRect = { width: 0, height: 0 };
  let pointerActive = false;
  let animationFrameId = null;

  // ---------- AUDIO SYSTEM ----------
  function initAudio() {
    if (!audioCtx && window.AudioContext) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playSliceSound() {
    if (!soundEnabled) return;
    try {
      const node = sliceSfx.cloneNode();
      node.volume = sliceSfx.volume;
      node.play().catch(() => {});
    } catch (e) {}
  }

  function playExplosionSound() {
    if (!soundEnabled) return;
    try {
      const node = bombSfx.cloneNode();
      node.volume = bombSfx.volume;
      node.play().catch(() => {});
    } catch (e) {}
  }

  function playComboSound() {
    if (!audioCtx || !soundEnabled) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 1200;
      gain.gain.value = 0.15;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.15);
      osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}
  }

  function startBackgroundMusic() {
    if (!audioCtx || !soundEnabled) return;
    try {
      if (bgmOscillator) {
        bgmGain.gain.rampTo(0, 0.5);
        setTimeout(() => { if (bgmOscillator) bgmOscillator.stop(); }, 500);
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = 220;
      gain.gain.value = 0.05;
      osc.start();
      bgmOscillator = osc;
      bgmGain = gain;
    } catch(e) {}
  }

  function stopBackgroundMusic() {
    if (bgmGain) bgmGain.gain.rampTo(0, 0.3);
  }

  // ---------- PARTICLE SYSTEM ----------
  function createExplosion(x, y) {
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 300;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        life: 1.0,
        size: 4 + Math.random() * 12,
        type: 'spark',
        color: `hsl(${20 + Math.random() * 40}, 100%, 55%)`
      });
    }
    for (let i = 0; i < 25; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 350,
        vy: (Math.random() - 0.5) * 350 - 120,
        life: 1.0,
        size: 6 + Math.random() * 14,
        type: 'juice',
        color: `hsl(${Math.random() * 50 + 20}, 90%, 60%)`
      });
    }
    playExplosionSound();
    shakeAmount = 18;
    shakeDuration = 0.4;
    if (navigator.vibrate) navigator.vibrate(200);
  }

  function updateParticles(deltaSec) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx * deltaSec;
      p.y += p.vy * deltaSec;
      p.vy += 450 * deltaSec;
      p.life -= deltaSec * 2.8;
      p.size *= 0.97;
    }
    particles = particles.filter(p => p.life > 0);
  }

  function drawParticles() {
    for (const p of particles) {
      effectCtx.save();
      effectCtx.globalAlpha = p.life * 0.85;
      effectCtx.fillStyle = p.color;
      effectCtx.beginPath();
      effectCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      effectCtx.fill();
      if (p.type === 'spark') {
        effectCtx.fillStyle = 'white';
        effectCtx.beginPath();
        effectCtx.arc(p.x - 2, p.y - 2, p.size * 0.3, 0, Math.PI * 2);
        effectCtx.fill();
      }
      effectCtx.restore();
    }
  }

  // ---------- ASSET LOADING WITH PROGRESS ----------
  async function loadAssets() {
    const extraPieceAssets = ["appleL.png", "appleR.png", "stawberryL.png", "stawberryR.png", "kiwiL.png", "kiwiR.png", "watermelonL.png", "watermelonR.png", "mongoL.png", "mangoL.png", "mongoR.png", "mangoR.png", "bananaR.png", "orangeL.png", "orangeR.png"];
    const totalAssets = fruitTypes.length + 1 + Object.keys(splashMap).length + extraPieceAssets.length;
    let loaded = 0;

    function updateProgress() {
      loaded++;
      const percent = (loaded / totalAssets) * 100;
      if (progressBar) progressBar.style.width = `${percent}%`;
    }

    const fruitPromises = fruitTypes.map(f => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = f.src;
        img.onload = () => { updateProgress(); resolve({ name: f.name, img }); };
        img.onerror = () => { updateProgress(); resolve({ name: f.name, img: null }); };
      });
    });

    const bombPromise = new Promise(resolve => {
      const img = new Image();
      img.src = assetUrl("bomb.png");
      img.onload = () => { updateProgress(); resolve({ name: "bomb", img }); };
      img.onerror = () => { updateProgress(); resolve({ name: "bomb", img: null }); };
    });

    const splashPromises = Object.entries(splashMap).map(([key, src]) => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = src;
        img.onload = () => { updateProgress(); resolve({ key, img }); };
        img.onerror = () => { updateProgress(); resolve({ key, img: null }); };
      });
    });

    const piecePromises = extraPieceAssets.map((file) => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = assetUrl(file);
        img.onload = () => { updateProgress(); resolve({ name: file, img }); };
        img.onerror = () => { updateProgress(); resolve({ name: file, img: null }); };
      });
    });

    const results = await Promise.all([...fruitPromises, bombPromise, ...splashPromises, ...piecePromises]);
    results.forEach(r => {
      if (r.name) assets[r.name] = r.img;
      else if (r.key) splashImages[r.key] = r.img;
    });

    const defaultImg = new Image();
    defaultImg.src = DEFAULT_SPLASH;
    await new Promise(r => { defaultImg.onload = r; });
    splashImages.default = defaultImg;
  }

  function getSplash(type) { return splashImages[type] || splashImages.default; }

  function addSplash(x, y, type) {
    splashes.push({
      x, y, life: 0, duration: 2000,
      scale: 1,
      rotation: 0,
      img: getSplash(type)
    });
  }

  function addApplePieces(fruit) {
    const leftImg = assets["appleL.png"];
    const rightImg = assets["appleR.png"];
    if (!leftImg || !rightImg) return;
    const baseVy = fruit.vy * 0.6 - 120;
    const spread = 220 + Math.random() * 60;
    const size = fruit.radius * 2.1;
    fruitPieces.push(
      {
        img: leftImg,
        x: fruit.x - fruit.radius * 0.35,
        y: fruit.y,
        vx: -spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: -3.5,
        size
      },
      {
        img: rightImg,
        x: fruit.x + fruit.radius * 0.35,
        y: fruit.y,
        vx: spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: 3.5,
        size
      }
    );
  }

  function addStawberryPieces(fruit) {
    const leftImg = assets["stawberryL.png"];
    const rightImg = assets["stawberryR.png"];
    if (!leftImg || !rightImg) return;
    const baseVy = fruit.vy * 0.6 - 120;
    const spread = 200 + Math.random() * 60;
    const size = fruit.radius * 2.0;
    fruitPieces.push(
      {
        img: leftImg,
        x: fruit.x - fruit.radius * 0.3,
        y: fruit.y,
        vx: -spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: -3.2,
        size
      },
      {
        img: rightImg,
        x: fruit.x + fruit.radius * 0.3,
        y: fruit.y,
        vx: spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: 3.2,
        size
      }
    );
  }

  function addKiwiPieces(fruit) {
    const leftImg = assets["kiwiL.png"];
    const rightImg = assets["kiwiR.png"];
    if (!leftImg || !rightImg) return;
    const baseVy = fruit.vy * 0.6 - 110;
    const spread = 190 + Math.random() * 50;
    const size = fruit.radius * 2.0;
    fruitPieces.push(
      {
        img: leftImg,
        x: fruit.x - fruit.radius * 0.3,
        y: fruit.y,
        vx: -spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: -3,
        size
      },
      {
        img: rightImg,
        x: fruit.x + fruit.radius * 0.3,
        y: fruit.y,
        vx: spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: 3,
        size
      }
    );
  }

  function addWatermelonPieces(fruit) {
    const leftImg = assets["watermelonL.png"];
    const rightImg = assets["watermelonR.png"];
    if (!leftImg || !rightImg) return;
    const baseVy = fruit.vy * 0.6 - 130;
    const spread = 230 + Math.random() * 70;
    const size = fruit.radius * 2.2;
    fruitPieces.push(
      {
        img: leftImg,
        x: fruit.x - fruit.radius * 0.32,
        y: fruit.y,
        vx: -spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: -2.8,
        size
      },
      {
        img: rightImg,
        x: fruit.x + fruit.radius * 0.32,
        y: fruit.y,
        vx: spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: 2.8,
        size
      }
    );
  }

  function addMangoPieces(fruit) {
    let leftImg = assets["mongoL.png"] || assets["mangoL.png"];
    let rightImg = assets["mongoR.png"] || assets["mangoR.png"];
    if (!leftImg && !rightImg) return;
    if (!leftImg) leftImg = rightImg;
    if (!rightImg) rightImg = leftImg;
    const baseVy = fruit.vy * 0.6 - 120;
    const spread = 210 + Math.random() * 60;
    const pieceW = fruit.radius * 1.45;
    const pieceH = fruit.radius * 2.1;
    fruitPieces.push(
      {
        img: leftImg,
        x: fruit.x - fruit.radius * 0.32,
        y: fruit.y,
        vx: -spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: -3,
        w: pieceW,
        h: pieceH,
        flipX: leftImg === rightImg
      },
      {
        img: rightImg,
        x: fruit.x + fruit.radius * 0.32,
        y: fruit.y,
        vx: spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: 3,
        w: pieceW,
        h: pieceH,
        flipX: false
      }
    );
  }

  function addBananaPieces(fruit) {
    const img = assets["bananaR.png"];
    if (!img) return;
    const baseVy = fruit.vy * 0.6 - 110;
    const spread = 220 + Math.random() * 60;
    const pieceW = fruit.radius * 1.2;
    const pieceH = fruit.radius * 2.4;
    fruitPieces.push(
      {
        img,
        x: fruit.x - fruit.radius * 0.28,
        y: fruit.y,
        vx: -spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: -3.2,
        w: pieceW,
        h: pieceH,
        flipX: true
      },
      {
        img,
        x: fruit.x + fruit.radius * 0.28,
        y: fruit.y,
        vx: spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: 3.2,
        w: pieceW,
        h: pieceH,
        flipX: false
      }
    );
  }

  function addOrangePieces(fruit) {
    const leftImg = assets["orangeL.png"];
    const rightImg = assets["orangeR.png"];
    if (!leftImg || !rightImg) return;
    const baseVy = fruit.vy * 0.6 - 110;
    const spread = 200 + Math.random() * 60;
    const size = fruit.radius * 2.0;
    fruitPieces.push(
      {
        img: leftImg,
        x: fruit.x - fruit.radius * 0.3,
        y: fruit.y,
        vx: -spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: -3.1,
        size
      },
      {
        img: rightImg,
        x: fruit.x + fruit.radius * 0.3,
        y: fruit.y,
        vx: spread,
        vy: baseVy,
        rotation: fruit.rotation,
        rotSpeed: 3.1,
        size
      }
    );
  }

  // ---------- GAME MECHANICS ----------
  function updateCanvasSize() {
    const boardArea = document.querySelector('.board-area');
    const rect = boardArea.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    effectCanvas.width = rect.width;
    effectCanvas.height = rect.height;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    effectCanvas.style.width = `${rect.width}px`;
    effectCanvas.style.height = `${rect.height}px`;
    ctx = canvas.getContext('2d');
    effectCtx = effectCanvas.getContext('2d');
    boardRect = { width: rect.width, height: rect.height };
  }

  function getPlayBounds() {
    const isNarrow = boardRect.width < 567;
    const sidePad = isNarrow ? 0.24 : 0.12;
    return {
      minX: boardRect.width * sidePad,
      maxX: boardRect.width * (1 - sidePad),
      minY: boardRect.height * 0.1,
      maxY: boardRect.height * 0.92
    };
  }

  function spawnFruit(isBomb = false) {
    const bounds = getPlayBounds();
    const radius = isBomb ? 48 : fruitTypes[0].radius;
    const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    const y = bounds.maxY + radius;
    const elapsed = (performance.now() - gameStartTime) / 1000;
    const speedBoost = Math.min(1.8, 1 + elapsed / 30);
    const vy = BASE_VY * 1.25 - Math.random() * 200 - (difficultyLevel * 30);
    const isNarrow = boardRect.width < 567;
    const maxVx = isNarrow ? 200 : (300 + speedBoost * 180);
    let vx = (Math.random() - 0.5) * maxVx * 2;
    const edgeGuard = isNarrow ? 70 : 45;
    if (x < bounds.minX + edgeGuard) vx = Math.abs(vx);
    if (x > bounds.maxX - edgeGuard) vx = -Math.abs(vx);

    if (isBomb) {
      fruits.push({
        type: 'bomb', x, y, vx, vy, radius: 40,
        rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 5,
        isBomb: true, entered: false
      });
    } else {
      const fruitDef = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
      fruits.push({
        type: fruitDef.name, x, y, vx, vy, radius: fruitDef.radius,
        points: fruitDef.points, rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 4, isBomb: false, entered: false
      });
    }
  }

  function segmentIntersectsCircle(ax, ay, bx, by, cx, cy, radius) {
    const abx = bx - ax, aby = by - ay;
    const t = Math.max(0, Math.min(1, ((cx - ax) * abx + (cy - ay) * aby) / (abx * abx + aby * aby || 1)));
    const closestX = ax + abx * t, closestY = ay + aby * t;
    const dx = cx - closestX, dy = cy - closestY;
    return (dx * dx + dy * dy) <= radius * radius;
  }

  function processSlice() {
    if (trailPoints.length < 2) return;
    const p1 = trailPoints[trailPoints.length - 2];
    const p2 = trailPoints[trailPoints.length - 1];
    let slicedAny = false;

    fruits = fruits.filter(fruit => {
      const hit = segmentIntersectsCircle(p1.x, p1.y, p2.x, p2.y, fruit.x, fruit.y, fruit.radius * 0.85);
      if (!hit) return true;

      if (fruit.isBomb) {
        playExplosionSound();
        gameRunning = false;
        bombAnimating = true;
        bombBlast = {
          start: performance.now(),
          duration: 3000,
          img: getSplash('bomb'),
          x: fruit.x,
          y: fruit.y,
          size: Math.max(180, fruit.radius * 4.2)
        };
        shakeAmount = 28;
        shakeDuration = 0.9;
        if (navigator.vibrate) navigator.vibrate([250, 120, 250]);
        return false;
      }

      slicedAny = true;
      score += fruit.points;
      totalSliced++;
      scoreSpan.textContent = score;
      addSplash(fruit.x, fruit.y, fruit.type);
      if (fruit.type === 'apple') addApplePieces(fruit);
      if (fruit.type === 'stawberry') addStawberryPieces(fruit);
      if (fruit.type === 'kiwi') addKiwiPieces(fruit);
      if (fruit.type === 'watermelon') addWatermelonPieces(fruit);
      if (fruit.type === 'mango') addMangoPieces(fruit);
      if (fruit.type === 'banana') addBananaPieces(fruit);
      if (fruit.type === 'orange') addOrangePieces(fruit);
      playSliceSound();

      if (comboTimeout) clearTimeout(comboTimeout);
      currentCombo++;
      if (currentCombo > bestCombo) bestCombo = currentCombo;
      comboValueSpan.textContent = currentCombo;
      if (currentCombo >= 3) playComboSound();

      const popup = document.createElement('div');
      popup.className = 'combo-popup';
      popup.textContent = `${currentCombo}x COMBO!`;
      document.querySelector('.board-area').appendChild(popup);
      setTimeout(() => popup.remove(), 600);

      comboTimeout = setTimeout(() => {
        currentCombo = 0;
        comboValueSpan.textContent = "0";
      }, 1800);
      return false;
    });

    if (slicedAny && navigator.vibrate) navigator.vibrate(15);
  }

  function addTrailPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let canvasX = (clientX - rect.left) * scaleX;
    let canvasY = (clientY - rect.top) * scaleY;
    canvasX = Math.min(boardRect.width, Math.max(0, canvasX));
    canvasY = Math.min(boardRect.height, Math.max(0, canvasY));

    const bounds = getPlayBounds();
    if (canvasX < bounds.minX - 30 || canvasX > bounds.maxX + 30) return;
    trailPoints.push({ x: canvasX, y: canvasY });
    if (trailPoints.length > 12) trailPoints.shift();
    processSlice();
  }

  function updateGame(deltaSec) {
    if (!gameRunning) return;
    const bounds = getPlayBounds();
    const now = performance.now();
    const elapsed = (now - gameStartTime) / 1000;
    difficultyLevel = Math.min(3, 1 + Math.floor(elapsed / 15));
    spawnDelay = Math.max(900, 1350 - Math.floor(elapsed * 8));

    if (now - lastSpawnTime > spawnDelay) {
      let count = Math.min(3, 1 + Math.floor(elapsed / 16));
      for (let i = 0; i < count; i++) spawnFruit(false);
      lastSpawnTime = now;
    }

    if (now >= nextBombTime) {
      spawnFruit(true);
      nextBombTime = now + 4000 + Math.random() * 2000;
    }

    for (let f of fruits) {
      f.vy += GRAVITY * deltaSec;
      f.x += f.vx * deltaSec;
      f.y += f.vy * deltaSec;
      f.rotation += f.rotSpeed * deltaSec;
      if (!f.entered && f.y + f.radius < bounds.maxY) f.entered = true;
    }

    for (let p of fruitPieces) {
      p.vy += GRAVITY * deltaSec;
      p.x += p.vx * deltaSec;
      p.y += p.vy * deltaSec;
      p.rotation += p.rotSpeed * deltaSec;
    }
    fruitPieces = fruitPieces.filter(p => {
      const size = p.size ?? Math.max(p.w || 0, p.h || 0);
      return p.y - size < bounds.maxY + 220;
    });

    fruits = fruits.filter(f => {
      if (f.entered && f.y - f.radius > bounds.maxY + 40) {
        if (!f.isBomb) {
          lives--;
          livesSpan.textContent = lives;
          if (comboTimeout) clearTimeout(comboTimeout);
          currentCombo = 0;
          comboValueSpan.textContent = "0";
          if (lives <= 0) gameOver();
        }
        return false;
      }
      return true;
    });

    for (let s of splashes) s.life += deltaSec * 1000;
    splashes = splashes.filter(s => s.life < s.duration);
    updateParticles(deltaSec);

    if (shakeDuration > 0) shakeDuration -= deltaSec;
    else shakeAmount = 0;
  }

  function draw() {
    ctx.clearRect(0, 0, boardRect.width, boardRect.height);
    effectCtx.clearRect(0, 0, boardRect.width, boardRect.height);

    let shakeX = 0, shakeY = 0;
    if (shakeDuration > 0 && shakeAmount > 0) {
      shakeX = (Math.random() - 0.5) * shakeAmount;
      shakeY = (Math.random() - 0.5) * shakeAmount;
      ctx.save();
      ctx.translate(shakeX, shakeY);
    }
    if (gameContainer) {
      if (shakeDuration > 0 && shakeAmount > 0) {
        gameContainer.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
      } else {
        gameContainer.style.transform = '';
      }
    }

    for (const fruit of fruits) {
      const img = assets[fruit.type];
      ctx.save();
      ctx.translate(fruit.x, fruit.y);
      ctx.rotate(fruit.rotation);
      ctx.shadowBlur = 6;
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      if (img) {
        const w = fruit.radius * 2, h = fruit.radius * 2;
        ctx.drawImage(img, -w/2, -h/2, w, h);
      } else {
        ctx.fillStyle = "#f4a261";
        ctx.beginPath();
        ctx.arc(0, 0, fruit.radius, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }

    for (const piece of fruitPieces) {
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      if (piece.flipX) ctx.scale(-1, 1);
      ctx.shadowBlur = 6;
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      if (piece.img) {
        const w = piece.w ?? piece.size;
        const h = piece.h ?? piece.size;
        ctx.drawImage(piece.img, -w / 2, -h / 2, w, h);
      }
      ctx.restore();
    }

    for (const splash of splashes) {
      const progress = splash.life / splash.duration;
      const fadeIn = Math.min(1, progress / 0.15);
      const fadeOut = 1 - progress;
      const alpha = fadeIn * fadeOut;
      const size = 130 * splash.scale;
      ctx.save();
      ctx.translate(splash.x, splash.y);
      ctx.rotate(0);
      ctx.globalAlpha = alpha * 0.9;
      if (splash.img) ctx.drawImage(splash.img, -size/2, -size/2, size, size);
      ctx.restore();
    }

    if (trailPoints.length > 1) {
      ctx.beginPath();
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      const gradient = ctx.createLinearGradient(trailPoints[0].x, trailPoints[0].y, trailPoints[trailPoints.length-1].x, trailPoints[trailPoints.length-1].y);
      gradient.addColorStop(0, "rgba(244, 228, 200, 0.9)");
      gradient.addColorStop(1, "rgba(210, 148, 90, 0.7)");
      ctx.strokeStyle = gradient;
      for (let i = 0; i < trailPoints.length-1; i++) {
        ctx.beginPath();
        ctx.moveTo(trailPoints[i].x, trailPoints[i].y);
        ctx.lineTo(trailPoints[i+1].x, trailPoints[i+1].y);
        ctx.stroke();
      }
    }

    if (shakeDuration > 0) ctx.restore();

    if (bombAnimating && bombBlast?.img) {
      const now = performance.now();
      const progress = Math.min(1, (now - bombBlast.start) / bombBlast.duration);
      const easeOut = 1 - Math.pow(1 - progress, 2);
      const fadeIn = Math.min(1, progress / 0.18);
      const fadeOut = 1 - Math.max(0, (progress - 0.65) / 0.35);
      const alpha = fadeIn * fadeOut;
      const scale = 0.7 + easeOut * 0.9;
      const baseSize = bombBlast.size || Math.min(boardRect.width, boardRect.height) * 0.55;
      effectCtx.save();
      effectCtx.globalAlpha = alpha;
      effectCtx.translate(bombBlast.x ?? boardRect.width / 2, bombBlast.y ?? boardRect.height / 2);
      effectCtx.scale(scale, scale);
      effectCtx.drawImage(bombBlast.img, -baseSize / 2, -baseSize / 2, baseSize, baseSize);
      effectCtx.restore();
    }
    drawParticles();
  }

  async function showLoadingAndStart() {
    startScreen.classList.add('hidden');
    loadingScreen.classList.remove('hidden');
    progressBar.style.width = '0%';
    await loadAssets();
    await new Promise(r => setTimeout(r, 500));
    loadingScreen.classList.add('hidden');
    startCountdown();
  }

  function startCountdown() {
    countdownScreen.classList.remove('hidden');
    let count = 3;
    const countdownNumber = document.getElementById('countdownNumber');
    countdownNumber.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        countdownScreen.classList.add('hidden');
        startGame();
      } else {
        countdownNumber.textContent = count;
      }
    }, 1000);
  }

  function startGame() {
    resetGameState();
    isPaused = false;
    gameRunning = true;
    if (soundEnabled) startBackgroundMusic();
    lastTimestamp = performance.now();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function resetGameState() {
    fruits = [];
    fruitPieces = [];
    splashes = [];
    particles = [];
    trailPoints = [];
    bombAnimating = false;
    bombBlast = null;
    score = 0;
    lives = 5;
    totalSliced = 0;
    currentCombo = 0;
    bestCombo = 0;
    difficultyLevel = 1;
    scoreSpan.textContent = "0";
    livesSpan.textContent = "5";
    comboValueSpan.textContent = "0";
    lastSpawnTime = performance.now();
    gameStartTime = performance.now();
    nextBombTime = gameStartTime + 5000;
    spawnDelay = 900;
    for (let i = 0; i < 2; i++) spawnFruit(false);
  }

  function gameOver() {
    gameRunning = false;
    isPaused = false;
    pauseScreen.classList.add('hidden');
    finalScoreSpan.textContent = score;
    finalComboSpan.textContent = bestCombo;
    finalFruitsSpan.textContent = totalSliced;
    gameOverlay.classList.remove('hidden');
    stopBackgroundMusic();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  }

  function restartGame() {
    gameOverlay.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    resetGameState();
    startCountdown();
  }

  function gameLoop(now) {
    if (!gameRunning && !bombAnimating) return;
    if (isPaused && !bombAnimating) return;
    let delta = Math.min(0.033, (now - lastTimestamp) / 1000);
    if (delta <= 0) { lastTimestamp = now; animationFrameId = requestAnimationFrame(gameLoop); return; }
    lastTimestamp = now;
    if (gameRunning) updateGame(delta);
    if (!gameRunning && bombAnimating) {
      if (shakeDuration > 0) shakeDuration -= delta;
      else shakeAmount = 0;
    }
    if (bombAnimating && bombBlast && now - bombBlast.start >= bombBlast.duration) {
      bombAnimating = false;
      bombBlast = null;
      gameOver();
      return;
    }
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function setPaused(paused) {
    if (!gameRunning) return;
    isPaused = paused;
    if (isPaused) {
      pauseScreen.classList.remove('hidden');
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else {
      pauseScreen.classList.add('hidden');
      lastTimestamp = performance.now();
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // Event handlers
  function onPointerStart(e) {
    e.preventDefault();
    if (!gameRunning || isPaused) return;
    pointerActive = true;
    const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);
    trailPoints = [];
    addTrailPoint(clientX, clientY);
  }

  function onPointerMove(e) {
    if (!pointerActive || !gameRunning || isPaused) return;
    e.preventDefault();
    const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);
    addTrailPoint(clientX, clientY);
  }

  function onPointerEnd() {
    pointerActive = false;
    trailPoints = [];
  }

  // Register events
  canvas.addEventListener('mousedown', onPointerStart);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerEnd);
  canvas.addEventListener('touchstart', onPointerStart, { passive: false });
  canvas.addEventListener('touchmove', onPointerMove, { passive: false });
  canvas.addEventListener('touchend', onPointerEnd);
  canvas.addEventListener('touchcancel', onPointerEnd);

  startBtn.addEventListener('click', () => { showLoadingAndStart(); });
  restartGameBtn.addEventListener('click', () => { restartGame(); });
  pauseBtn.addEventListener('click', () => { setPaused(!isPaused); });
  resumeBtn.addEventListener('click', () => { setPaused(false); });
  restartBtn.addEventListener('click', () => { setPaused(false); restartGame(); });
  exitBtn.addEventListener('click', () => {
    setPaused(false);
    gameRunning = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    stopBackgroundMusic();
    startScreen.classList.remove('hidden');
    loadingScreen.classList.add('hidden');
    countdownScreen.classList.add('hidden');
    gameOverlay.classList.add('hidden');
  });

  window.addEventListener('resize', () => { updateCanvasSize(); draw(); });

  // Initial setup
  updateCanvasSize();
  startScreen.classList.remove('hidden');
  loadingScreen.classList.add('hidden');
  countdownScreen.classList.add('hidden');
  gameOverlay.classList.add('hidden');
  pauseScreen.classList.add('hidden');
  draw();
})();
