const BUBBLE_COLORS = ["#67c4ff", "#a977ff", "#58d6b3", "#ffd45e", "#ffb067", "#4a90ff"];

const CONFIG = {
    width: 540,
    height: 720,
    radius: 18,
    cols: 12,
    rows: 14,
    topPadding: 74,
    shooterOffsetBottom: 72,
    bubbleSpeed: 860,
    minAimAngle: -Math.PI + 0.2,
    maxAimAngle: -0.2,
    dotsSpacing: 18,
    maxPreviewBounces: 2
};

const ROW_HEIGHT = Math.sqrt(3) * CONFIG.radius;
const GRID_WIDTH = CONFIG.cols * CONFIG.radius * 2 + CONFIG.radius;
const GRID_LEFT = (CONFIG.width - GRID_WIDTH) / 2;
const SHOOTER = {
    x: CONFIG.width / 2,
    y: CONFIG.height - CONFIG.shooterOffsetBottom
};

const TOTAL_LEVELS = 20;

const state = {
    canvas: null,
    ctx: null,
    currentLevel: 1,
    score: 0,
    ballsLeft: 0,
    levelProgress: {},
    grid: [],
    activeColors: [],
    currentBubbleColor: BUBBLE_COLORS[0],
    nextBubbleColor: BUBBLE_COLORS[1],
    flyingBubble: null,
    aimAngle: -Math.PI / 2,
    isPointerDown: false,
    isPaused: false,
    isGameActive: false,
    loopId: 0,
    lastTs: 0,
    popEffects: [],
    fallingBubbles: [],
    ambientParticles: createAmbientParticles(),
    jellyfish: createJellyfish(),
    soundEnabled: true,
    audioContext: null
};

for (let i = 1; i <= TOTAL_LEVELS; i++) {
    state.levelProgress[i] = { completed: false, stars: 0 };
}

const screens = {
    loading: document.getElementById("loadingScreen"),
    menu: document.getElementById("mainMenu"),
    levelSelect: document.getElementById("levelSelectScreen"),
    game: document.getElementById("gameScreen")
};

const overlays = {
    pause: document.getElementById("pausePopup"),
    complete: document.getElementById("levelCompletePopup"),
    over: document.getElementById("gameOverPopup")
};

function makeGrid() {
    return Array.from({ length: CONFIG.rows }, () => Array(CONFIG.cols).fill(null));
}

function cellKey(row, col) {
    return `${row},${col}`;
}

function isInsideGrid(row, col) {
    return row >= 0 && row < CONFIG.rows && col >= 0 && col < CONFIG.cols;
}

function cellToPixel(row, col) {
    const offsetX = row % 2 === 1 ? CONFIG.radius : 0;
    return {
        x: GRID_LEFT + CONFIG.radius + offsetX + col * CONFIG.radius * 2,
        y: CONFIG.topPadding + CONFIG.radius + row * ROW_HEIGHT
    };
}

function pixelToApproxCell(x, y) {
    const rawRow = Math.round((y - CONFIG.topPadding - CONFIG.radius) / ROW_HEIGHT);
    const row = Math.max(0, Math.min(CONFIG.rows - 1, rawRow));
    const offsetX = row % 2 === 1 ? CONFIG.radius : 0;
    const rawCol = Math.round((x - GRID_LEFT - CONFIG.radius - offsetX) / (CONFIG.radius * 2));
    const col = Math.max(0, Math.min(CONFIG.cols - 1, rawCol));
    return { row, col };
}

function getNeighborCoords(row, col) {
    const evenOffsets = [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];
    const oddOffsets = [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
    const offsets = row % 2 === 0 ? evenOffsets : oddOffsets;
    return offsets
        .map(([dr, dc]) => ({ row: row + dr, col: col + dc }))
        .filter(({ row: nr, col: nc }) => isInsideGrid(nr, nc));
}

function getOccupiedCells() {
    const occupied = [];
    for (let row = 0; row < CONFIG.rows; row++) {
        for (let col = 0; col < CONFIG.cols; col++) {
            if (state.grid[row][col]) occupied.push(state.grid[row][col]);
        }
    }
    return occupied;
}

function getActiveBoardColors() {
    const colors = new Set();
    for (const bubble of getOccupiedCells()) colors.add(bubble.color);
    return colors.size ? [...colors] : [...BUBBLE_COLORS];
}

function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function chooseShooterColor() {
    state.activeColors = getActiveBoardColors();
    return randomFrom(state.activeColors);
}

function clampAimAngle(angle) {
    return Math.max(CONFIG.minAimAngle, Math.min(CONFIG.maxAimAngle, angle));
}

function createAmbientParticles() {
    return Array.from({ length: 42 }, () => ({
        x: Math.random() * CONFIG.width,
        y: Math.random() * CONFIG.height,
        size: 1 + Math.random() * 3,
        speed: 8 + Math.random() * 22,
        sway: Math.random() * Math.PI * 2
    }));
}

function createJellyfish() {
    return Array.from({ length: 8 }, (_, index) => ({
        baseX: 80 + (index % 4) * 118 + Math.random() * 18,
        baseY: 115 + Math.floor(index / 4) * 160 + Math.random() * 30,
        drift: Math.random() * Math.PI * 2,
        scale: 0.55 + Math.random() * 0.55,
        speed: 0.4 + Math.random() * 0.45
    }));
}

function ensureAudioContext() {
    if (!state.soundEnabled) return null;
    if (!state.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        state.audioContext = new AudioCtx();
    }
    if (state.audioContext.state === "suspended") {
        state.audioContext.resume().catch(() => {});
    }
    return state.audioContext;
}

function playFx(type) {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const presets = {
        shoot: [
            { freq: 620, duration: 0.08, gain: 0.05, kind: "triangle" },
            { freq: 860, duration: 0.05, gain: 0.03, kind: "sine", offset: 0.03 }
        ],
        pop: [
            { freq: 340, duration: 0.09, gain: 0.07, kind: "square" },
            { freq: 190, duration: 0.12, gain: 0.05, kind: "triangle", offset: 0.02 }
        ],
        win: [
            { freq: 660, duration: 0.12, gain: 0.05, kind: "sine" },
            { freq: 880, duration: 0.14, gain: 0.05, kind: "triangle", offset: 0.1 },
            { freq: 1120, duration: 0.18, gain: 0.04, kind: "sine", offset: 0.2 }
        ]
    };

    for (const tone of presets[type] || []) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tone.kind;
        osc.frequency.setValueAtTime(tone.freq, ctx.currentTime + (tone.offset || 0));
        gain.gain.setValueAtTime(tone.gain, ctx.currentTime + (tone.offset || 0));
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (tone.offset || 0) + tone.duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + (tone.offset || 0));
        osc.stop(ctx.currentTime + (tone.offset || 0) + tone.duration);
    }
}

function updateHud() {
    document.getElementById("currentLevelNum").textContent = state.currentLevel;
    document.getElementById("currentScore").textContent = state.score;
    document.getElementById("currentBalls").textContent = state.ballsLeft;
    document.getElementById("nextBallPreview").style.background = bubbleGradient(state.nextBubbleColor);
}

function bubbleGradient(color) {
    return `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, ${color} 38%, ${shadeColor(color, -28)} 100%)`;
}

function shadeColor(hex, amt) {
    const value = hex.replace("#", "");
    const num = parseInt(value, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amt));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return `rgb(${r}, ${g}, ${b})`;
}

function generateLevel(level) {
    const grid = makeGrid();
    const colorPool = BUBBLE_COLORS.slice(0, Math.min(4 + Math.floor(level / 3), BUBBLE_COLORS.length));
    const rowsToFill = Math.min(5 + Math.floor(level / 2), 9);

    for (let row = 0; row < rowsToFill; row++) {
        const widthDrop = Math.floor(row * 0.6);
        const usableCols = Math.max(5, CONFIG.cols - 2 - widthDrop);
        const startCol = Math.floor((CONFIG.cols - usableCols) / 2);
        for (let col = startCol; col < startCol + usableCols; col++) {
            if (level > 3 && row > 1 && Math.random() < Math.min(0.06 + level * 0.01, 0.16)) continue;
            const position = cellToPixel(row, col);
            grid[row][col] = {
                row,
                col,
                color: randomFrom(colorPool),
                x: position.x,
                y: position.y
            };
        }
    }

    return { grid, colorPool };
}

function resetForLevel(level) {
    const levelData = generateLevel(level);
    state.grid = levelData.grid;
    state.activeColors = levelData.colorPool;
    state.score = 0;
    state.ballsLeft = 54 - Math.min(18, level * 2);
    state.flyingBubble = null;
    state.popEffects = [];
    state.fallingBubbles = [];
    state.aimAngle = -Math.PI / 2;
    state.currentBubbleColor = chooseShooterColor();
    state.nextBubbleColor = chooseShooterColor();
    state.isGameActive = true;
    state.isPaused = false;
    overlays.pause.classList.remove("active");
    overlays.complete.classList.remove("active");
    overlays.over.classList.remove("active");
    updateHud();
}

function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
}

function startLevel(level) {
    state.currentLevel = level;
    resetForLevel(level);
    showScreen("gameScreen");
    startLoop();
}

function restartLevel() {
    resetForLevel(state.currentLevel);
    startLoop();
}

function loadLevelSelect() {
    const grid = document.getElementById("levelGrid");
    grid.innerHTML = "";

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const unlocked = i === 1 || state.levelProgress[i - 1]?.completed;
        const progress = state.levelProgress[i];
        const card = document.createElement("button");
        card.type = "button";
        card.className = "level-card";

        if (!unlocked) {
            card.classList.add("locked");
            card.disabled = true;
            card.innerHTML = `<div><i class="fas fa-lock"></i> ${i}</div>`;
        } else {
            if (progress.completed) card.classList.add("completed");
            card.innerHTML = `
                <div>${i}</div>
                <div class="star-rating">
                    ${'<i class="fas fa-star"></i>'.repeat(progress.stars)}
                    ${'<i class="far fa-star"></i>'.repeat(3 - progress.stars)}
                </div>
            `;
            card.addEventListener("click", () => startLevel(i));
        }

        grid.appendChild(card);
    }
}

function getPointerPosition(event) {
    const rect = state.canvas.getBoundingClientRect();
    const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? event.changedTouches?.[0]?.clientX;
    const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? event.changedTouches?.[0]?.clientY;
    const scaleX = CONFIG.width / rect.width;
    const scaleY = CONFIG.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function updateAimFromPointer(x, y) {
    const angle = Math.atan2(y - SHOOTER.y, x - SHOOTER.x);
    state.aimAngle = clampAimAngle(angle);
}

function handlePointerDown(event) {
    if (!state.isGameActive || state.isPaused || state.flyingBubble) return;
    event.preventDefault();
    const point = getPointerPosition(event);
    updateAimFromPointer(point.x, point.y);
    state.isPointerDown = true;
    ensureAudioContext();
}

function handlePointerMove(event) {
    if (!state.isGameActive) return;
    event.preventDefault();
    const point = getPointerPosition(event);
    updateAimFromPointer(point.x, point.y);
}

function handlePointerUp(event) {
    if (!state.isPointerDown || !state.isGameActive || state.isPaused) return;
    event.preventDefault();
    state.isPointerDown = false;
    shootBubble();
}

function shootBubble() {
    if (state.flyingBubble || state.ballsLeft <= 0) return;

    const angle = clampAimAngle(state.aimAngle);
    const vx = Math.cos(angle) * CONFIG.bubbleSpeed;
    const vy = Math.sin(angle) * CONFIG.bubbleSpeed;

    if (vy >= -20) return;

    state.flyingBubble = {
        x: SHOOTER.x,
        y: SHOOTER.y - 14,
        vx,
        vy,
        color: state.currentBubbleColor
    };

    state.ballsLeft -= 1;
    state.currentBubbleColor = state.nextBubbleColor;
    state.nextBubbleColor = chooseShooterColor();
    updateHud();
    playFx("shoot");
    checkForLoseState();
}

function findSnapCell(x, y) {
    const approx = pixelToApproxCell(x, y);
    const candidates = [];

    for (let row = approx.row - 2; row <= approx.row + 2; row++) {
        for (let col = approx.col - 2; col <= approx.col + 2; col++) {
            if (!isInsideGrid(row, col) || state.grid[row][col]) continue;
            const hasAnchor = row === 0 || getNeighborCoords(row, col).some((cell) => !!state.grid[cell.row][cell.col]);
            if (!hasAnchor) continue;
            const point = cellToPixel(row, col);
            const distance = Math.hypot(point.x - x, point.y - y);
            candidates.push({ row, col, distance, y: point.y });
        }
    }

    if (!candidates.length) {
        for (let row = 0; row < CONFIG.rows; row++) {
            for (let col = 0; col < CONFIG.cols; col++) {
                if (state.grid[row][col]) continue;
                const point = cellToPixel(row, col);
                candidates.push({ row, col, distance: Math.hypot(point.x - x, point.y - y), y: point.y });
            }
        }
    }

    candidates.sort((a, b) => a.distance - b.distance || a.y - b.y);
    return candidates[0] || null;
}

function getNearbyOccupied(x, y) {
    const approx = pixelToApproxCell(x, y);
    const neighbors = [];
    for (let row = approx.row - 2; row <= approx.row + 2; row++) {
        for (let col = approx.col - 2; col <= approx.col + 2; col++) {
            if (!isInsideGrid(row, col)) continue;
            const bubble = state.grid[row][col];
            if (bubble) neighbors.push(bubble);
        }
    }
    return neighbors;
}

function placeFlyingBubble() {
    const targetCell = findSnapCell(state.flyingBubble.x, state.flyingBubble.y);
    if (!targetCell) {
        state.flyingBubble = null;
        state.isGameActive = false;
        document.getElementById("gameOverScoreVal").textContent = state.score;
        overlays.over.classList.add("active");
        return;
    }
    const point = cellToPixel(targetCell.row, targetCell.col);

    state.grid[targetCell.row][targetCell.col] = {
        row: targetCell.row,
        col: targetCell.col,
        color: state.flyingBubble.color,
        x: point.x,
        y: point.y
    };

    const anchoredBubble = state.grid[targetCell.row][targetCell.col];
    state.flyingBubble = null;
    resolveBoardAfterPlacement(anchoredBubble);
}

function updateFlyingBubble(dt) {
    if (!state.flyingBubble) return;

    const bubble = state.flyingBubble;
    bubble.x += bubble.vx * dt;
    bubble.y += bubble.vy * dt;

    if (bubble.x <= CONFIG.radius) {
        bubble.x = CONFIG.radius;
        bubble.vx = Math.abs(bubble.vx);
    } else if (bubble.x >= CONFIG.width - CONFIG.radius) {
        bubble.x = CONFIG.width - CONFIG.radius;
        bubble.vx = -Math.abs(bubble.vx);
    }

    if (bubble.y <= CONFIG.topPadding + CONFIG.radius) {
        bubble.y = CONFIG.topPadding + CONFIG.radius;
        placeFlyingBubble();
        return;
    }

    for (const occupied of getNearbyOccupied(bubble.x, bubble.y)) {
        if (Math.hypot(occupied.x - bubble.x, occupied.y - bubble.y) <= CONFIG.radius * 2 - 2) {
            placeFlyingBubble();
            return;
        }
    }
}

function findCluster(startRow, startCol, color) {
    const stack = [{ row: startRow, col: startCol }];
    const visited = new Set();
    const cluster = [];

    while (stack.length) {
        const cell = stack.pop();
        const key = cellKey(cell.row, cell.col);
        if (visited.has(key)) continue;
        visited.add(key);
        const bubble = state.grid[cell.row][cell.col];
        if (!bubble || bubble.color !== color) continue;

        cluster.push({ row: cell.row, col: cell.col });
        for (const neighbor of getNeighborCoords(cell.row, cell.col)) {
            if (!visited.has(cellKey(neighbor.row, neighbor.col))) stack.push(neighbor);
        }
    }

    return cluster;
}

function addPopEffect(bubble) {
    state.popEffects.push({
        x: bubble.x,
        y: bubble.y,
        color: bubble.color,
        life: 0.28
    });
}

function detachFloatingBubbles() {
    const connected = new Set();
    const queue = [];

    for (let col = 0; col < CONFIG.cols; col++) {
        if (state.grid[0][col]) {
            queue.push({ row: 0, col });
            connected.add(cellKey(0, col));
        }
    }

    while (queue.length) {
        const current = queue.shift();
        for (const next of getNeighborCoords(current.row, current.col)) {
            const key = cellKey(next.row, next.col);
            if (!state.grid[next.row][next.col] || connected.has(key)) continue;
            connected.add(key);
            queue.push(next);
        }
    }

    let removed = 0;
    for (let row = 0; row < CONFIG.rows; row++) {
        for (let col = 0; col < CONFIG.cols; col++) {
            const bubble = state.grid[row][col];
            if (!bubble || connected.has(cellKey(row, col))) continue;
            state.fallingBubbles.push({
                x: bubble.x,
                y: bubble.y,
                color: bubble.color,
                vx: (Math.random() - 0.5) * 65,
                vy: 60 + Math.random() * 40,
                rotation: Math.random() * Math.PI,
                spin: (Math.random() - 0.5) * 4
            });
            state.grid[row][col] = null;
            removed += 1;
        }
    }

    if (removed > 0) {
        state.score += removed * 15;
        playFx("pop");
    }
}

function resolveBoardAfterPlacement(placedBubble) {
    const cluster = findCluster(placedBubble.row, placedBubble.col, placedBubble.color);
    let removedCount = 0;

    if (cluster.length >= 3) {
        for (const cell of cluster) {
            const bubble = state.grid[cell.row][cell.col];
            if (!bubble) continue;
            addPopEffect(bubble);
            state.grid[cell.row][cell.col] = null;
            removedCount += 1;
        }
        state.score += removedCount * 20;
        playFx("pop");
        detachFloatingBubbles();
    }

    state.activeColors = getActiveBoardColors();
    if (state.activeColors.length) {
        if (!state.activeColors.includes(state.currentBubbleColor)) {
            state.currentBubbleColor = chooseShooterColor();
        }
        if (!state.activeColors.includes(state.nextBubbleColor)) {
            state.nextBubbleColor = chooseShooterColor();
        }
    }

    updateHud();
    checkForWinState();
    checkForLoseState();
}

function checkForWinState() {
    if (getOccupiedCells().length !== 0) return;
    state.isGameActive = false;
    const stars = state.ballsLeft >= 28 ? 3 : state.ballsLeft >= 16 ? 2 : 1;
    state.levelProgress[state.currentLevel] = { completed: true, stars };
    document.getElementById("finalScoreVal").textContent = state.score;
    document.getElementById("starsResult").innerHTML =
        `${'<i class="fas fa-star"></i>'.repeat(stars)}${'<i class="far fa-star"></i>'.repeat(3 - stars)}`;
    overlays.complete.classList.add("active");
    playFx("win");
}

function checkForLoseState() {
    if (!state.isGameActive) return;

    if (state.ballsLeft <= 0 && !state.flyingBubble && getOccupiedCells().length > 0) {
        state.isGameActive = false;
    }

    const limitY = SHOOTER.y - CONFIG.radius * 3;
    const reachedShooter = getOccupiedCells().some((bubble) => bubble.y >= limitY);
    if (reachedShooter) {
        state.isGameActive = false;
    }

    if (!state.isGameActive && getOccupiedCells().length > 0) {
        document.getElementById("gameOverScoreVal").textContent = state.score;
        overlays.over.classList.add("active");
    }
}

function updatePopEffects(dt) {
    state.popEffects = state.popEffects.filter((effect) => {
        effect.life -= dt;
        return effect.life > 0;
    });
}

function updateFallingBubbles(dt) {
    state.fallingBubbles = state.fallingBubbles.filter((bubble) => {
        bubble.vy += 300 * dt;
        bubble.x += bubble.vx * dt;
        bubble.y += bubble.vy * dt;
        bubble.rotation += bubble.spin * dt;
        return bubble.y < CONFIG.height + 60;
    });
}

function updateAmbient(dt) {
    for (const particle of state.ambientParticles) {
        particle.y -= particle.speed * dt;
        particle.x += Math.sin(performance.now() * 0.001 + particle.sway) * 5 * dt;
        if (particle.y < -10) {
            particle.y = CONFIG.height + 10;
            particle.x = Math.random() * CONFIG.width;
        }
    }
}

function drawBackground(ctx, time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    gradient.addColorStop(0, "rgba(4, 22, 58, 0.84)");
    gradient.addColorStop(0.55, "rgba(18, 71, 121, 0.42)");
    gradient.addColorStop(1, "rgba(3, 27, 60, 0.6)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    for (const particle of state.ambientParticles) {
        ctx.globalAlpha = 0.2 + particle.size * 0.12;
        ctx.fillStyle = "#a8ecff";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    drawSeabedGlow(ctx);
    drawJellyfish(ctx, time);
}

function drawSeabedGlow(ctx) {
    const leftGlow = ctx.createRadialGradient(90, CONFIG.height - 90, 10, 90, CONFIG.height - 90, 210);
    leftGlow.addColorStop(0, "rgba(112, 255, 232, 0.18)");
    leftGlow.addColorStop(1, "rgba(112, 255, 232, 0)");
    ctx.fillStyle = leftGlow;
    ctx.fillRect(0, CONFIG.height - 240, 280, 240);

    const rightGlow = ctx.createRadialGradient(CONFIG.width - 110, CONFIG.height - 120, 12, CONFIG.width - 110, CONFIG.height - 120, 220);
    rightGlow.addColorStop(0, "rgba(152, 184, 255, 0.16)");
    rightGlow.addColorStop(1, "rgba(152, 184, 255, 0)");
    ctx.fillStyle = rightGlow;
    ctx.fillRect(CONFIG.width - 280, CONFIG.height - 260, 280, 260);
}

function drawJellyfish(ctx, time) {
    for (const jelly of state.jellyfish) {
        const x = jelly.baseX + Math.sin(time * jelly.speed + jelly.drift) * 14;
        const y = jelly.baseY + Math.cos(time * 0.7 + jelly.drift) * 10;
        const r = 22 * jelly.scale;

        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = 0.22;
        const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 1.8);
        glow.addColorStop(0, "rgba(121, 255, 249, 0.35)");
        glow.addColorStop(1, "rgba(121, 255, 249, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.34;
        ctx.fillStyle = "rgba(123, 255, 249, 0.28)";
        ctx.beginPath();
        ctx.ellipse(0, -2, r, r * 0.65, 0, Math.PI, 0);
        ctx.fill();

        ctx.strokeStyle = "rgba(162, 255, 248, 0.25)";
        ctx.lineWidth = 1;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 5, 2);
            ctx.bezierCurveTo(i * 4, r * 0.8, i * 8 + Math.sin(time * 2 + i) * 4, r * 1.4, i * 6, r * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
    ctx.globalAlpha = 1;
}

function drawBubble(ctx, x, y, color, scale = 1, alpha = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    const bubbleGradientFill = ctx.createRadialGradient(-6, -8, 2, 0, 0, CONFIG.radius);
    bubbleGradientFill.addColorStop(0, "rgba(255,255,255,0.96)");
    bubbleGradientFill.addColorStop(0.25, color);
    bubbleGradientFill.addColorStop(1, shadeColor(color, -36));

    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.radius - 1.2, 0, Math.PI * 2);
    ctx.fillStyle = bubbleGradientFill;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "rgba(233, 248, 255, 0.95)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-6, -7, 4.8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
    ctx.restore();
}

function drawGridBubbles(ctx) {
    for (let row = 0; row < CONFIG.rows; row++) {
        for (let col = 0; col < CONFIG.cols; col++) {
            const bubble = state.grid[row][col];
            if (!bubble) continue;
            drawBubble(ctx, bubble.x, bubble.y, bubble.color);
        }
    }
}

function drawFallingBubbles(ctx) {
    for (const bubble of state.fallingBubbles) {
        ctx.save();
        ctx.translate(bubble.x, bubble.y);
        ctx.rotate(bubble.rotation);
        drawBubble(ctx, 0, 0, bubble.color, 0.96, 0.9);
        ctx.restore();
    }
}

function drawPopEffects(ctx) {
    for (const effect of state.popEffects) {
        const progress = 1 - effect.life / 0.28;
        drawBubble(ctx, effect.x, effect.y, effect.color, 1 + progress * 0.6, 1 - progress);
        ctx.save();
        ctx.globalAlpha = 0.35 * (1 - progress);
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, CONFIG.radius + progress * 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

function drawShooter(ctx) {
    const barrelLength = 44;
    const barrelX = SHOOTER.x + Math.cos(state.aimAngle) * barrelLength * 0.5;
    const barrelY = SHOOTER.y + Math.sin(state.aimAngle) * barrelLength * 0.5;

    ctx.save();
    ctx.translate(SHOOTER.x, SHOOTER.y);
    ctx.rotate(state.aimAngle + Math.PI / 2);

    ctx.fillStyle = "rgba(31, 81, 120, 0.88)";
    ctx.fillRect(-12, -38, 24, 46);
    ctx.fillStyle = "rgba(111, 198, 255, 0.82)";
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(16, -10);
    ctx.quadraticCurveTo(30, -10, 30, 4);
    ctx.lineTo(30, 6);
    ctx.quadraticCurveTo(30, 20, 16, 20);
    ctx.lineTo(-16, 20);
    ctx.quadraticCurveTo(-30, 20, -30, 6);
    ctx.lineTo(-30, 4);
    ctx.quadraticCurveTo(-30, -10, -16, -10);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(44, 114, 168, 0.7)";
    ctx.beginPath();
    ctx.arc(SHOOTER.x, SHOOTER.y + 6, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawBubble(ctx, barrelX, barrelY, state.currentBubbleColor);
}

function drawFlyingBubble(ctx) {
    if (!state.flyingBubble) return;
    drawBubble(ctx, state.flyingBubble.x, state.flyingBubble.y, state.flyingBubble.color);
}

function buildTrajectoryDots() {
    if (!state.isGameActive || state.flyingBubble) return [];

    const dots = [];
    let x = SHOOTER.x;
    let y = SHOOTER.y - 14;
    let vx = Math.cos(state.aimAngle) * CONFIG.dotsSpacing;
    let vy = Math.sin(state.aimAngle) * CONFIG.dotsSpacing;
    let bounces = 0;

    for (let i = 0; i < 42; i++) {
        x += vx;
        y += vy;

        if (x <= CONFIG.radius) {
            x = CONFIG.radius;
            vx = Math.abs(vx);
            bounces += 1;
        } else if (x >= CONFIG.width - CONFIG.radius) {
            x = CONFIG.width - CONFIG.radius;
            vx = -Math.abs(vx);
            bounces += 1;
        }

        dots.push({ x, y });
        if (y <= CONFIG.topPadding + CONFIG.radius) break;

        const hit = getNearbyOccupied(x, y).some((bubble) => Math.hypot(bubble.x - x, bubble.y - y) <= CONFIG.radius * 2 - 2);
        if (hit || bounces > CONFIG.maxPreviewBounces) break;
    }

    return dots;
}

function drawTrajectory(ctx) {
    const dots = buildTrajectoryDots();
    for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const alpha = 0.9 - i * 0.02;
        if (alpha <= 0) break;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = i < 20 ? "#ffd966" : "#9fe3ff";
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3.4 - i * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawTopBoundary(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(179, 228, 255, 0.3)";
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(GRID_LEFT, CONFIG.topPadding - 14);
    ctx.lineTo(CONFIG.width - GRID_LEFT, CONFIG.topPadding - 14);
    ctx.stroke();
    ctx.restore();
}

function render(ts) {
    const ctx = state.ctx;
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);
    const time = ts * 0.001;

    drawBackground(ctx, time);
    drawTopBoundary(ctx);
    drawGridBubbles(ctx);
    drawFallingBubbles(ctx);
    drawPopEffects(ctx);
    if (!state.flyingBubble) drawTrajectory(ctx);
    drawFlyingBubble(ctx);
    drawShooter(ctx);
}

function update(dt) {
    if (!state.isPaused && state.isGameActive) {
        updateFlyingBubble(dt);
        updatePopEffects(dt);
        updateFallingBubbles(dt);
        updateAmbient(dt);
    } else {
        updatePopEffects(dt);
        updateFallingBubbles(dt);
        updateAmbient(dt);
    }
}

function loop(ts) {
    if (!state.lastTs) state.lastTs = ts;
    const dt = Math.min(0.032, (ts - state.lastTs) / 1000);
    state.lastTs = ts;

    update(dt);
    render(ts);
    state.loopId = requestAnimationFrame(loop);
}

function startLoop() {
    cancelAnimationFrame(state.loopId);
    state.lastTs = 0;
    state.loopId = requestAnimationFrame(loop);
}

function togglePause(forceState) {
    state.isPaused = typeof forceState === "boolean" ? forceState : !state.isPaused;
    overlays.pause.classList.toggle("active", state.isPaused);
}

function closeAllOverlays() {
    Object.values(overlays).forEach((overlay) => overlay.classList.remove("active"));
    state.isPaused = false;
}

function setupEvents() {
    state.canvas = document.getElementById("gameCanvas");
    state.ctx = state.canvas.getContext("2d");
    state.canvas.width = CONFIG.width;
    state.canvas.height = CONFIG.height;

    state.canvas.addEventListener("pointerdown", handlePointerDown);
    state.canvas.addEventListener("pointermove", handlePointerMove);
    state.canvas.addEventListener("pointerup", handlePointerUp);
    state.canvas.addEventListener("pointercancel", () => {
        state.isPointerDown = false;
    });
    state.canvas.addEventListener("pointerleave", (event) => {
        if (state.isPointerDown) handlePointerUp(event);
    });

    document.getElementById("pauseGameBtn").addEventListener("click", () => {
        if (!state.isGameActive) return;
        togglePause(true);
    });
    document.getElementById("resumeGameBtn").addEventListener("click", () => togglePause(false));
    document.getElementById("restartPauseBtn").addEventListener("click", () => {
        closeAllOverlays();
        restartLevel();
    });
    document.getElementById("menuPauseBtn").addEventListener("click", () => {
        closeAllOverlays();
        showScreen("mainMenu");
    });
    document.getElementById("restartLevelBtn").addEventListener("click", restartLevel);
    document.getElementById("exitGameMenuBtn").addEventListener("click", () => {
        closeAllOverlays();
        showScreen("mainMenu");
    });

    document.getElementById("nextLevelActionBtn").addEventListener("click", () => {
        overlays.complete.classList.remove("active");
        if (state.currentLevel < TOTAL_LEVELS) {
            startLevel(state.currentLevel + 1);
        } else {
            showScreen("mainMenu");
        }
    });
    document.getElementById("replayLevelActionBtn").addEventListener("click", () => {
        closeAllOverlays();
        restartLevel();
    });
    document.getElementById("levelSelectCompleteBtn").addEventListener("click", () => {
        overlays.complete.classList.remove("active");
        loadLevelSelect();
        showScreen("levelSelectScreen");
    });
    document.getElementById("retryGameBtn").addEventListener("click", () => {
        closeAllOverlays();
        restartLevel();
    });
    document.getElementById("gameOverMenuBtn").addEventListener("click", () => {
        closeAllOverlays();
        showScreen("mainMenu");
    });

    document.getElementById("playNowBtn").addEventListener("click", () => startLevel(1));
    document.getElementById("levelSelectMenuBtn").addEventListener("click", () => {
        loadLevelSelect();
        showScreen("levelSelectScreen");
    });
    document.getElementById("backToMenuBtn").addEventListener("click", () => showScreen("mainMenu"));

    const soundButton = document.getElementById("soundMenuBtn");
    soundButton.addEventListener("click", () => {
        state.soundEnabled = !state.soundEnabled;
        soundButton.innerHTML = state.soundEnabled
            ? '<i class="fas fa-volume-up"></i> SOUND ON'
            : '<i class="fas fa-volume-mute"></i> SOUND OFF';
    });
}

function runLoadingSequence() {
    let percent = 0;
    const loadFill = document.getElementById("loadFill");
    const loadText = document.getElementById("loadPercentText");

    const interval = setInterval(() => {
        percent += 8 + Math.random() * 16;
        if (percent >= 100) {
            percent = 100;
            clearInterval(interval);
            loadFill.style.width = "100%";
            loadText.textContent = "Loading 100%";
            setTimeout(() => {
                screens.loading.classList.remove("active");
                screens.menu.classList.add("active");
            }, 350);
            return;
        }

        loadFill.style.width = `${percent}%`;
        loadText.textContent = `Loading ${Math.floor(percent)}%`;
    }, 120);
}

setupEvents();
loadLevelSelect();
runLoadingSequence();
startLoop();
