const BEST_SCORE_KEY = "billiard_master_best";

const BALL_RADIUS = 12;
const POCKET_RADIUS = 22;
const FRICTION = 0.985;
const MIN_VELOCITY = 0.1;
const MAX_POWER = 20;
const GAME_TIME = 120;
const COMBO_TIME_BONUS = 5;
const CUE_BALL_PENALTY_TIME = 5;
const TABLE_ASPECT = 2;

const BALL_COLORS = {
  1: { fill: "#F5D033", stripe: false },
  2: { fill: "#1A5BA6", stripe: false },
  3: { fill: "#D43A2F", stripe: false },
  4: { fill: "#5B2D8E", stripe: false },
  5: { fill: "#E8732C", stripe: false },
  6: { fill: "#1B7E3A", stripe: false },
  7: { fill: "#8B1A2B", stripe: false },
  8: { fill: "#1A1A1A", stripe: false },
  9: { fill: "#F5D033", stripe: true },
  10: { fill: "#1A5BA6", stripe: true },
  11: { fill: "#D43A2F", stripe: true },
  12: { fill: "#5B2D8E", stripe: true },
  13: { fill: "#E8732C", stripe: true },
  14: { fill: "#1B7E3A", stripe: true },
  15: { fill: "#8B1A2B", stripe: true },
};

const SOUNDS = {
  hit: new Audio("audio/hit.wav"),
  pocket: new Audio("audio/pocket.wav"),
  over: new Audio("audio/over.wav"),
};

for (const s of Object.values(SOUNDS)) {
  s.preload = "auto";
}

function playSound(sound) {
  if (!sound) return;
  try {
    sound.currentTime = 0;
    sound.play();
  } catch {
    // Ignore autoplay errors.
  }
}

const ASSETS = {
  felt: new Image(),
  wood: new Image(),
  pocketRing: new Image(),
  pocketShadow: new Image(),
};

ASSETS.felt.src = "images/Felt%20Texture.png";
ASSETS.wood.src = "images/Wood%20Rail%20Texture.png";
ASSETS.pocketRing.src = "images/Pocket%20Ring.png";
ASSETS.pocketShadow.src = "images/Pocket%20Shadow.png";

function getBestScore() {
  return parseInt(sessionStorage.getItem(BEST_SCORE_KEY) || "0", 10);
}

function saveBestScore(score) {
  const current = getBestScore();
  if (score > current) {
    sessionStorage.setItem(BEST_SCORE_KEY, String(score));
  }
}

function createLoadingScreen(onComplete) {
  const root = document.createElement("div");
  root.className = "fixed inset-0 flex flex-col items-center justify-center bg-background";
  root.innerHTML = `
    <div class="absolute inset-0 opacity-20">
      <div class="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-amber-950 to-transparent"></div>
      <div class="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-amber-950 to-transparent"></div>
    </div>

    <div class="relative mb-16 text-center">
      <img src="images/Logo%20Banner.png" alt="Cue Master Pool Rush" class="w-72 sm:w-96 mx-auto select-none" />

      <div class="flex items-center justify-center gap-2 mt-4 opacity-70">
        <div class="h-1 w-32 rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-700"></div>
        <div class="w-4 h-4 rounded-full bg-foreground/80 shadow-lg"></div>
      </div>
    </div>

    <div class="relative w-64 sm:w-80">
      <div class="relative h-8 rounded-full border-2 border-foreground/20 overflow-hidden" style="background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%); box-shadow: inset 0 3px 8px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05);">
        <div class="absolute inset-y-0 left-0 rounded-full transition-all duration-100 ease-out" data-progress-fill style="width: 0%; background: linear-gradient(180deg, #c8a848 0%, #8b6914 40%, #a07820 60%, #6b4c10 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.3);">
          <div class="absolute inset-0 flex">
            ${Array.from({ length: 20 })
              .map(() => '<div class="flex-1 border-r border-black/10 last:border-r-0"></div>')
              .join("")}
          </div>
          <div class="absolute inset-x-0 top-0.5 h-1.5 mx-1 rounded-full bg-gradient-to-b from-white/30 to-transparent"></div>
        </div>
        <div class="absolute top-1/2 -translate-y-1/2 transition-all duration-100" data-progress-ball style="left: calc(0% - 6px);">
          <div class="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-300 border border-cyan-400/50" style="box-shadow: 0 0 8px rgba(100,200,255,0.5), inset 0 -2px 3px rgba(0,0,0,0.2);"></div>
        </div>
      </div>

      <p class="text-center mt-3 text-xl font-bold text-foreground/80 text-shadow-sm tracking-wider" data-progress-text>0%</p>
    </div>
  `;

  const fill = root.querySelector("[data-progress-fill]");
  const ball = root.querySelector("[data-progress-ball]");
  const text = root.querySelector("[data-progress-text]");

  let progress = 0;
  let timeoutId = 0;
  const intervalId = window.setInterval(() => {
    progress += Math.random() * 4 + 1;
    if (progress >= 100) {
      progress = 100;
      clearInterval(intervalId);
      timeoutId = window.setTimeout(onComplete, 400);
    }
    fill.style.width = `${progress}%`;
    const capped = Math.min(progress, 97);
    ball.style.left = `calc(${capped}% - 6px)`;
    text.textContent = `${Math.floor(progress)}%`;
  }, 60);

  return {
    root,
    destroy() {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    },
  };
}

function createStartScreen(bestScore, onPlay) {
  const root = document.createElement("div");
  root.className = "fixed inset-0 flex flex-col items-center justify-center bg-background";
  root.innerHTML = `
    <div class="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-amber-950/30 to-transparent"></div>
    <div class="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-amber-950/30 to-transparent"></div>

    <div class="mb-12 text-center">
      <img src="images/Logo%20Banner.png" alt="Cue Master Pool Rush" class="w-72 sm:w-96 mx-auto select-none" />
    </div>

    <button class="btn-3d px-12 py-4 rounded-2xl text-2xl mb-8 transition-transform" data-play
      style="background: linear-gradient(180deg, #22c55e 0%, #15803d 100%); color: #fff; border: 2px solid rgba(255,255,255,0.15); letter-spacing: 0.1em;">
      ▶ PLAY
    </button>

    <div class="game-panel px-8 py-4 text-center">
      <p class="text-muted-foreground text-sm uppercase tracking-widest mb-1">Best Score</p>
      <p class="text-3xl font-black text-secondary" data-best>${bestScore}</p>
    </div>

    <div class="absolute bottom-8 flex gap-3 opacity-40">
      ${[
        "#F5D033",
        "#1A5BA6",
        "#D43A2F",
        "#5B2D8E",
        "#E8732C",
        "#1B7E3A",
        "#8B1A2B",
        "#1a1a1a",
      ]
        .map(
          (c) =>
            `<div class="w-5 h-5 rounded-full" style="background: radial-gradient(circle at 35% 35%, ${c}dd, ${c});"></div>`
        )
        .join("")}
    </div>
  `;

  const playBtn = root.querySelector("[data-play]");
  playBtn.addEventListener("click", onPlay);

  return {
    root,
    destroy() {
      playBtn.removeEventListener("click", onPlay);
    },
  };
}

function createGameOverScreen(score, bestScore, onReplay) {
  const root = document.createElement("div");
  root.className =
    "fixed inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-50 animate-fade-in";
  const isNewBest = score >= bestScore && score > 0;

  root.innerHTML = `
    <div class="game-panel p-8 sm:p-12 text-center max-w-sm w-full mx-4">
      <h2 class="text-4xl font-black text-accent mb-2 text-shadow-lg">GAME OVER</h2>
      ${isNewBest ? '<p class="text-secondary font-bold text-lg animate-pulse mb-4">🏆 NEW BEST SCORE! 🏆</p>' : ""}

      <div class="space-y-4 my-8">
        <div>
          <p class="text-muted-foreground text-sm uppercase tracking-widest">Your Score</p>
          <p class="text-5xl font-black text-foreground">${score}</p>
        </div>
        <div class="h-px bg-border"></div>
        <div>
          <p class="text-muted-foreground text-sm uppercase tracking-widest">Best Score</p>
          <p class="text-3xl font-bold text-secondary">${bestScore}</p>
        </div>
      </div>

      <button class="btn-3d w-full py-4 rounded-xl text-xl" data-replay
        style="background: linear-gradient(180deg, #22c55e 0%, #15803d 100%); color: #fff; border: 2px solid rgba(255,255,255,0.15); letter-spacing: 0.1em;">
        ↻ PLAY AGAIN
      </button>
    </div>
  `;

  const replayBtn = root.querySelector("[data-replay]");
  replayBtn.addEventListener("click", onReplay);

  return {
    root,
    destroy() {
      replayBtn.removeEventListener("click", onReplay);
    },
  };
}
function getPockets(t) {
  const inset = Math.min(t.w, t.h) * 0.015;
  return [
    { x: t.x + inset, y: t.y + inset },
    { x: t.x + t.w / 2, y: t.y - 2 },
    { x: t.x + t.w - inset, y: t.y + inset },
    { x: t.x + inset, y: t.y + t.h - inset },
    { x: t.x + t.w / 2, y: t.y + t.h + 2 },
    { x: t.x + t.w - inset, y: t.y + t.h - inset },
  ];
}

function stepPhysics(balls, table, ballRadius, pocketRadius) {
  const pocketed = [];
  const pockets = getPockets(table);

  for (const b of balls) {
    if (b.pocketed) continue;
    b.x += b.vx;
    b.y += b.vy;
    b.vx *= FRICTION;
    b.vy *= FRICTION;
    if (Math.abs(b.vx) < MIN_VELOCITY) b.vx = 0;
    if (Math.abs(b.vy) < MIN_VELOCITY) b.vy = 0;
  }

  for (const b of balls) {
    if (b.pocketed) continue;
    const left = table.x + ballRadius;
    const right = table.x + table.w - ballRadius;
    const top = table.y + ballRadius;
    const bottom = table.y + table.h - ballRadius;

    if (b.x < left) {
      b.x = left;
      b.vx = Math.abs(b.vx) * 0.85;
    }
    if (b.x > right) {
      b.x = right;
      b.vx = -Math.abs(b.vx) * 0.85;
    }
    if (b.y < top) {
      b.y = top;
      b.vy = Math.abs(b.vy) * 0.85;
    }
    if (b.y > bottom) {
      b.y = bottom;
      b.vy = -Math.abs(b.vy) * 0.85;
    }
  }

  const active = balls.filter((b) => !b.pocketed);
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = ballRadius * 2;
      if (dist < minDist && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;
        a.x -= (nx * overlap) / 2;
        a.y -= (ny * overlap) / 2;
        b.x += (nx * overlap) / 2;
        b.y += (ny * overlap) / 2;
        const dvx = a.vx - b.vx;
        const dvy = a.vy - b.vy;
        const dot = dvx * nx + dvy * ny;
        if (dot > 0) {
          a.vx -= dot * nx * 0.95;
          a.vy -= dot * ny * 0.95;
          b.vx += dot * nx * 0.95;
          b.vy += dot * ny * 0.95;
        }
      }
    }
  }

  for (const b of balls) {
    if (b.pocketed) continue;
    for (const p of pockets) {
      const dx = b.x - p.x;
      const dy = b.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < pocketRadius) {
        b.pocketed = true;
        b.vx = 0;
        b.vy = 0;
        pocketed.push(b.id);
        break;
      }
    }
  }

  return pocketed;
}

function allStopped(balls) {
  return balls.filter((b) => !b.pocketed).every((b) => b.vx === 0 && b.vy === 0);
}

function initBalls(table, ballRadius) {
  const cx = table.x + table.w * 0.7;
  const cy = table.y + table.h / 2;
  // Tight rack: balls should touch with minimal gap
  const s = ballRadius * 2.0;
  const balls = [
    { id: 0, x: table.x + table.w * 0.25, y: table.y + table.h / 2, vx: 0, vy: 0, pocketed: false },
  ];

  const rackOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  let idx = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      if (idx >= rackOrder.length) break;
      balls.push({
        id: rackOrder[idx],
        x: cx + row * s * 0.866,
        y: cy + (col - row / 2) * s,
        vx: 0,
        vy: 0,
        pocketed: false,
      });
      idx++;
    }
  }
  return balls;
}

function drawTable(ctx, t, ballRadius, pocketRadius) {
  const bw = Math.max(12, Math.min(28, t.w * 0.04));
  const outerR = 12;
  const woodPattern =
    ASSETS.wood.complete && ASSETS.wood.naturalWidth
      ? ctx.createPattern(ASSETS.wood, "repeat")
      : null;
  ctx.fillStyle = woodPattern || "#5a3520";
  roundRect(ctx, t.x - bw, t.y - bw, t.w + bw * 2, t.h + bw * 2, outerR);
  ctx.fill();

  ctx.fillStyle = "#3a2010";
  roundRect(ctx, t.x - 4, t.y - 4, t.w + 8, t.h + 8, 4);
  ctx.fill();

  const feltPattern =
    ASSETS.felt.complete && ASSETS.felt.naturalWidth
      ? ctx.createPattern(ASSETS.felt, "repeat")
      : null;
  if (feltPattern) {
    ctx.fillStyle = feltPattern;
  } else {
    const feltGrad = ctx.createRadialGradient(
      t.x + t.w / 2,
      t.y + t.h / 2,
      0,
      t.x + t.w / 2,
      t.y + t.h / 2,
      Math.max(t.w, t.h) * 0.6
    );
    feltGrad.addColorStop(0, "#2d8c4e");
    feltGrad.addColorStop(1, "#1a6b35");
    ctx.fillStyle = feltGrad;
  }
  ctx.fillRect(t.x, t.y, t.w, t.h);

  ctx.strokeStyle = "rgba(255,255,255,0.015)";
  ctx.lineWidth = 1;
  for (let i = 0; i < t.w; i += 8) {
    ctx.beginPath();
    ctx.moveTo(t.x + i, t.y);
    ctx.lineTo(t.x + i, t.y + t.h);
    ctx.stroke();
  }

  const pocketR = pocketRadius;
  const railW = Math.max(4, Math.min(8, t.w * 0.012));
  const railColor = "#1a6b35";
  const railHighlight = "#35a060";

  drawRail(ctx, t.x + pocketR + 10, t.y, t.w / 2 - pocketR - 15, railW, railColor, railHighlight);
  drawRail(ctx, t.x + t.w / 2 + 5, t.y, t.w / 2 - pocketR - 15, railW, railColor, railHighlight);
  drawRail(ctx, t.x + pocketR + 10, t.y + t.h - railW, t.w / 2 - pocketR - 15, railW, railColor, railHighlight);
  drawRail(ctx, t.x + t.w / 2 + 5, t.y + t.h - railW, t.w / 2 - pocketR - 15, railW, railColor, railHighlight);
  drawRailV(ctx, t.x, t.y + pocketR + 10, railW, t.h - pocketR * 2 - 20, railColor, railHighlight);
  drawRailV(ctx, t.x + t.w - railW, t.y + pocketR + 10, railW, t.h - pocketR * 2 - 20, railColor, railHighlight);

  const pockets = getPockets(t);
  for (const p of pockets) {
    if (ASSETS.pocketShadow.complete && ASSETS.pocketShadow.naturalWidth) {
      const s = pocketR * 2.4;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(ASSETS.pocketShadow, p.x - s / 2, p.y - s / 2, s, s);
      ctx.globalAlpha = 1;
    }
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pocketR);
    grad.addColorStop(0, "#0a0a0a");
    grad.addColorStop(0.7, "#1a1a1a");
    grad.addColorStop(1, "#0a0a0a");
    ctx.beginPath();
    ctx.arc(p.x, p.y, pocketR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    if (ASSETS.pocketRing.complete && ASSETS.pocketRing.naturalWidth) {
      const r = pocketR * 2.1;
      ctx.drawImage(ASSETS.pocketRing, p.x - r / 2, p.y - r / 2, r, r);
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, pocketR + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#3a2010";
    ctx.lineWidth = Math.max(2, bw * 0.1);
    ctx.stroke();
  }

  const diamondColor = "#c4a35a";
  const dOff = bw * 0.5;
  for (let i = 1; i <= 3; i++) {
    drawDiamond(ctx, t.x + (t.w * i) / 4, t.y - dOff, diamondColor, bw * 0.12);
    drawDiamond(ctx, t.x + (t.w * i) / 4, t.y + t.h + dOff, diamondColor, bw * 0.12);
    drawDiamond(ctx, t.x - dOff, t.y + (t.h * i) / 4, diamondColor, bw * 0.12);
    drawDiamond(ctx, t.x + t.w + dOff, t.y + (t.h * i) / 4, diamondColor, bw * 0.12);
  }
}

function drawRail(ctx, x, y, w, h, color, highlight) {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = highlight;
  ctx.fillRect(x, y, w, Math.max(1, h * 0.25));
}

function drawRailV(ctx, x, y, w, h, color, highlight) {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = highlight;
  ctx.fillRect(x, y, Math.max(1, w * 0.25), h);
}

function drawDiamond(ctx, cx, cy, color, size) {
  const s = Math.max(2, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = color;
  ctx.fillRect(-s, -s, s * 2, s * 2);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBall(ctx, ball, ballRadius) {
  if (ball.pocketed) return;
  const { x, y, id } = ball;
  const r = ballRadius;

  if (id === 0) {
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.7, "#e8e8e8");
    grad.addColorStop(1, "#c0c0c0");
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fill();
    return;
  }

  const info = BALL_COLORS[id];
  if (!info) return;

  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, lightenColor(info.fill, 40));
  grad.addColorStop(0.6, info.fill);
  grad.addColorStop(1, darkenColor(info.fill, 30));
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  if (info.stripe) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - r, y - r * 0.35, r * 2, r * 0.7);
    ctx.restore();
  }

  const numR = Math.max(1, r * 0.42);
  ctx.beginPath();
  ctx.arc(x, y, numR, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${Math.max(6, r * 0.55)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(id), x, y + 1);

  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.3, Math.max(1, r * 0.22), 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCue(ctx, cueBall, angle, pullBack, ballRadius) {
  if (cueBall.pocketed) return;
  const dist = ballRadius + 8 + pullBack;
  const length = Math.max(100, ballRadius * 16);
  const startX = cueBall.x - Math.cos(angle) * dist;
  const startY = cueBall.y - Math.sin(angle) * dist;

  ctx.save();
  ctx.translate(startX, startY);
  ctx.rotate(angle + Math.PI);

  const hw = Math.max(2, ballRadius * 0.3);

  ctx.fillStyle = "#4a90c0";
  ctx.fillRect(-2, -hw * 0.5, 8, hw);

  ctx.fillStyle = "#f8f8f0";
  ctx.fillRect(6, -hw * 0.6, 12, hw * 1.2);

  const cueGrad = ctx.createLinearGradient(0, -hw, 0, hw);
  cueGrad.addColorStop(0, "#f0d890");
  cueGrad.addColorStop(0.3, "#c8a848");
  cueGrad.addColorStop(0.7, "#a08030");
  cueGrad.addColorStop(1, "#806020");
  ctx.fillStyle = cueGrad;
  ctx.fillRect(18, -hw * 0.7, length - 18, hw * 1.4);

  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(length * 0.6, -hw * 0.85, 30, hw * 1.7);

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(length - 20, -hw, 20, hw * 2);

  ctx.restore();

  const guideLen = Math.max(60, ballRadius * 10);
  const guideEndX = cueBall.x + Math.cos(angle) * guideLen;
  const guideEndY = cueBall.y + Math.sin(angle) * guideLen;

  ctx.save();
  ctx.setLineDash([4, 6]);
  ctx.strokeStyle = "rgba(230, 230, 230, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cueBall.x, cueBall.y);
  ctx.lineTo(guideEndX, guideEndY);
  ctx.stroke();

  const arrowSize = Math.max(6, ballRadius * 0.4);
  ctx.fillStyle = "rgba(220, 220, 220, 0.95)";
  ctx.strokeStyle = "rgba(35, 35, 35, 0.85)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(guideEndX, guideEndY);
  ctx.lineTo(
    guideEndX - Math.cos(angle) * arrowSize + Math.sin(angle) * arrowSize * 0.5,
    guideEndY - Math.sin(angle) * arrowSize - Math.cos(angle) * arrowSize * 0.5
  );
  ctx.lineTo(
    guideEndX - Math.cos(angle) * arrowSize - Math.sin(angle) * arrowSize * 0.5,
    guideEndY - Math.sin(angle) * arrowSize + Math.cos(angle) * arrowSize * 0.5
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawParticles(ctx, particles) {
  for (const p of particles) {
    const r = Math.max(0.1, p.size * Math.max(0, p.life));
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function drawPowerBar(ctx, power, maxPower, x, y, h) {
  const w = 16;
  const ratio = Math.max(0, Math.min(1, power / maxPower));

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  roundRectFill(ctx, x, y, w, h, 6);

  const fillH = h * ratio;
  if (fillH > 4) {
    const grad = ctx.createLinearGradient(x, y + h, x, y + h - fillH);
    grad.addColorStop(0, "#22c55e");
    grad.addColorStop(0.5, "#eab308");
    grad.addColorStop(1, "#ef4444");
    ctx.fillStyle = grad;
    roundRectFill(ctx, x + 2, y + h - fillH + 2, w - 4, fillH - 4, 4);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  roundRectStroke(ctx, x, y, w, h, 6);
}

function roundRectFill(ctx, x, y, w, h, r) {
  if (h <= 0 || w <= 0) return;
  r = Math.min(r, w / 2, h / 2);
  if (r < 0) r = 0;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function roundRectStroke(ctx, x, y, w, h, r) {
  if (h <= 0 || w <= 0) return;
  r = Math.min(r, w / 2, h / 2);
  if (r < 0) r = 0;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.stroke();
}

function computeLayout(cw, ch, headerH = 48) {
  const isPortrait = ch > cw;
  const smallWidth = cw < 768;
  const usePortraitTable = isPortrait && smallWidth;
  const padding = usePortraitTable ? 14 : 18;
  const availW = cw - padding * 2;
  const availH = ch - headerH - padding * 2;

  // On small screens use vertical table to avoid overflow
  const aspect = usePortraitTable ? 0.6 : TABLE_ASPECT; // w/h

  let tw = availW;
  let th = tw / aspect;
  if (th > availH) {
    th = availH;
    tw = th * aspect;
  }

  // Reduce table size a bit for more breathing room
  const scale = usePortraitTable ? 0.92 : 0.9;
  tw *= scale;
  th *= scale;

  const ballRadius = Math.max(
    6,
    Math.min(usePortraitTable ? 14 : 18, th * (usePortraitTable ? 0.05 : 0.06))
  );
  const pocketRadius = ballRadius * (usePortraitTable ? 1.35 : 1.7);

  return {
    table: {
      x: (cw - tw) / 2,
      y: headerH + (availH - th) / 2 + padding,
      w: tw,
      h: th,
    },
    ballRadius,
    pocketRadius,
  };
}
class PoolGame {
  constructor(onGameOver) {
    this.onGameOver = onGameOver;
    this.root = null;
    this.canvas = null;
    this.ctx = null;
    this.animFrame = 0;
    this.timer = 0;
    this.ended = false;
    this.needsInitialRerack = true;

    this.state = {
      balls: [],
      particles: [],
      table: { x: 0, y: 0, w: 0, h: 0 },
      aiming: false,
      aimAngle: 0,
      aimPower: 0,
      dragStart: null,
      score: 0,
      combo: 0,
      timeLeft: GAME_TIME,
      lastShotPocketed: false,
      comboText: "",
      comboTextTimer: 0,
      gameActive: true,
      canShoot: true,
      ballsPocketedDisplay: [],
      ballRadius: BALL_RADIUS,
      pocketRadius: POCKET_RADIUS,
    };

    this.ui = {
      score: 0,
      timeLeft: GAME_TIME,
      combo: 0,
      comboText: "",
      pocketed: [],
    };

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.resizeCanvas = this.resizeCanvas.bind(this);
  }

  mount(container) {
    this.root = document.createElement("div");
    this.root.className = "fixed inset-0 bg-background overflow-hidden";
    this.root.innerHTML = `
      <div class="relative w-full h-full p-2 sm:p-4">
        <div class="game-shell w-full h-full rounded-2xl overflow-hidden">
          <div
            class="game-hud z-20 rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-md shadow-lg px-3 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            data-hud
          >
            <div class="hud-section flex items-center gap-3 min-w-[180px] w-full sm:w-auto justify-between sm:justify-start">
              <div class="hud-label text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Pocketed</div>
              <div class="hud-pocketed flex flex-wrap gap-1 max-w-[240px]" data-pocketed></div>
            </div>

            <div class="game-panel hud-card px-4 py-2 sm:px-6 sm:py-2 text-center text-foreground" data-time>
              <span class="text-lg sm:text-3xl font-black tabular-nums" data-time-value>${GAME_TIME}</span>
              <span class="hud-unit text-xs sm:text-base text-muted-foreground">s</span>
            </div>

            <div class="game-panel hud-card px-4 py-2 sm:px-6 sm:py-2 text-right">
              <span class="text-base sm:text-2xl font-black text-secondary tabular-nums" data-score>0</span>
              <span class="hud-unit text-[10px] sm:text-xs text-muted-foreground ml-0.5">pts</span>
            </div>
          </div>

          <div class="game-stage relative flex-1 rounded-2xl overflow-hidden">
            <canvas class="w-full h-full cursor-crosshair touch-none"></canvas>

            <div class="combo-overlay absolute z-20 animate-fade-in hidden" data-combo-text>
              <span class="text-sm sm:text-2xl font-black text-shadow-lg whitespace-nowrap" data-combo-text-value></span>
            </div>

            <div class="combo-sub absolute z-20 hidden" data-combo>
              <span class="text-xs sm:text-sm text-muted-foreground font-bold" data-combo-value></span>
            </div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(this.root);

    this.canvas = this.root.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.pocketedContainer = this.root.querySelector("[data-pocketed]");
    this.timeWrap = this.root.querySelector("[data-time]");
    this.timeValue = this.root.querySelector("[data-time-value]");
    this.scoreEl = this.root.querySelector("[data-score]");
    this.stageWrap = this.root.querySelector(".game-stage");
    this.comboTextWrap = this.root.querySelector("[data-combo-text]");
    this.comboTextValue = this.root.querySelector("[data-combo-text-value]");
    this.comboWrap = this.root.querySelector("[data-combo]");
    this.comboValue = this.root.querySelector("[data-combo-value]");

    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas);
    this.resizeObserver = null;
    const observed = this.canvas?.parentElement || this.canvas;
    if (observed && "ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
      this.resizeObserver.observe(observed);
    }
    this.rafResizeId = requestAnimationFrame(() => this.resizeCanvas());
    this.resizeTimeoutId = window.setTimeout(() => this.resizeCanvas(), 150);

    this.canvas.addEventListener("mousedown", this.handlePointerDown);
    this.canvas.addEventListener("mousemove", this.handlePointerMove);
    this.canvas.addEventListener("mouseup", this.handlePointerUp);
    this.canvas.addEventListener("mouseleave", this.handlePointerUp);
    this.canvas.addEventListener("touchstart", this.handlePointerDown, { passive: false });
    this.canvas.addEventListener("touchmove", this.handlePointerMove, { passive: false });
    this.canvas.addEventListener("touchend", this.handlePointerUp, { passive: false });

    this.timer = window.setInterval(() => {
      const s = this.state;
      if (!s.gameActive || this.ended) return;
      s.timeLeft -= 1;
      if (s.timeLeft <= 0) {
        s.timeLeft = 0;
        s.gameActive = false;
        this.triggerGameOver();
      }
      this.updateTime(Math.floor(s.timeLeft));
    }, 1000);

    const loop = () => {
      if (!this.canvas || !this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      const s = this.state;

      this.ctx.clearRect(0, 0, rect.width, rect.height);
      drawTable(this.ctx, s.table, s.ballRadius, s.pocketRadius);

      if (s.gameActive) {
        const pocketedIds = stepPhysics(s.balls, s.table, s.ballRadius, s.pocketRadius);
        if (pocketedIds.length > 0) {
          this.handlePocketed(pocketedIds);
        }

        if (!s.canShoot && allStopped(s.balls)) {
          s.canShoot = true;
          if (!s.lastShotPocketed) {
            s.combo = 0;
            this.updateCombo(0);
          }
          s.lastShotPocketed = false;
        }
      }

      for (const ball of s.balls) {
        drawBall(this.ctx, ball, s.ballRadius);
      }

      const cueBall = s.balls.find((b) => b.id === 0);
      if (cueBall && !cueBall.pocketed && s.canShoot && s.gameActive) {
        if (s.aiming && s.dragStart) {
          drawCue(this.ctx, cueBall, s.aimAngle, s.aimPower * 3, s.ballRadius);
          drawPowerBar(
            this.ctx,
            s.aimPower,
            MAX_POWER,
            s.table.x + s.table.w + 10,
            s.table.y,
            s.table.h
          );
        } else {
          drawCue(this.ctx, cueBall, s.aimAngle, 0, s.ballRadius);
        }
      }

      s.particles = s.particles.filter((p) => p.life > 0);
      for (const p of s.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 0.02;
      }
      drawParticles(this.ctx, s.particles);

      if (s.comboTextTimer > 0) {
        s.comboTextTimer--;
        if (s.comboTextTimer <= 0) {
          s.comboText = "";
          this.updateComboText("");
        }
      }

      this.animFrame = requestAnimationFrame(loop);
    };

    this.animFrame = requestAnimationFrame(loop);
  }

  destroy() {
    cancelAnimationFrame(this.animFrame);
    clearInterval(this.timer);
    window.removeEventListener("resize", this.resizeCanvas);
    if (this.rafResizeId) cancelAnimationFrame(this.rafResizeId);
    if (this.resizeTimeoutId) clearTimeout(this.resizeTimeoutId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.canvas) {
      this.canvas.removeEventListener("mousedown", this.handlePointerDown);
      this.canvas.removeEventListener("mousemove", this.handlePointerMove);
      this.canvas.removeEventListener("mouseup", this.handlePointerUp);
      this.canvas.removeEventListener("mouseleave", this.handlePointerUp);
      this.canvas.removeEventListener("touchstart", this.handlePointerDown);
      this.canvas.removeEventListener("touchmove", this.handlePointerMove);
      this.canvas.removeEventListener("touchend", this.handlePointerUp);
    }
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const isPortrait = rect.height > rect.width;
    const smallWidth = rect.width < 768;
    const usePortraitTable = isPortrait && smallWidth;
    const layoutMode = usePortraitTable ? "portrait" : "landscape";
    if (this.root) {
      this.root.dataset.layout = layoutMode;
    }
    document.body.dataset.layout = layoutMode;

    if (this.stageWrap) {
      if (this.comboTextWrap) this.stageWrap.appendChild(this.comboTextWrap);
      if (this.comboWrap) this.stageWrap.appendChild(this.comboWrap);
    }
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    const ctx = this.canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    const s = this.state;
    const oldTable = { ...s.table };
    const layout = computeLayout(rect.width, rect.height, 0);
    s.table = layout.table;
    s.ballRadius = layout.ballRadius;
    s.pocketRadius = layout.pocketRadius;

    if (this.comboTextWrap && this.comboWrap) {
      const cx = s.table.x + s.table.w / 2;
      const cy = s.table.y + s.table.h / 2;
      this.comboTextWrap.style.left = `${cx}px`;
      this.comboTextWrap.style.top = `${cy - 14}px`;
      this.comboTextWrap.style.transform = "translate(-50%, -50%)";
      this.comboWrap.style.left = `${cx}px`;
      this.comboWrap.style.top = `${cy + 14}px`;
      this.comboWrap.style.transform = "translate(-50%, -50%)";
    }

    if (s.balls.length === 0) {
      s.balls = initBalls(s.table, s.ballRadius);
    } else if (oldTable.w > 0) {
      for (const b of s.balls) {
        b.x = s.table.x + ((b.x - oldTable.x) / oldTable.w) * s.table.w;
        b.y = s.table.y + ((b.y - oldTable.y) / oldTable.h) * s.table.h;
      }
    }

    // If first layout pass was too early, re-rack once when things are stable.
    const sizeShift =
      oldTable.w > 0 &&
      (Math.abs(oldTable.w - s.table.w) > 2 || Math.abs(oldTable.h - s.table.h) > 2);
    if (
      this.needsInitialRerack &&
      sizeShift &&
      s.canShoot &&
      s.timeLeft === GAME_TIME &&
      s.score === 0 &&
      s.combo === 0 &&
      s.ballsPocketedDisplay.length === 0
    ) {
      s.balls = initBalls(s.table, s.ballRadius);
      this.needsInitialRerack = false;
    }
  }

  getCanvasPos(e) {
    if (!this.canvas) return { x: 0, y: 0 };
    const rect = this.canvas.getBoundingClientRect();
    let clientX;
    let clientY;
    if (e.touches) {
      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return { x: 0, y: 0 };
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  handlePointerDown(e) {
    e.preventDefault();
    const s = this.state;
    if (!s.canShoot || !s.gameActive) return;
    const cueBall = s.balls.find((b) => b.id === 0);
    if (!cueBall || cueBall.pocketed) return;

    const pos = this.getCanvasPos(e);
    s.aiming = true;
    s.dragStart = pos;
    s.aimAngle = Math.atan2(pos.y - cueBall.y, pos.x - cueBall.x) + Math.PI;
  }

  handlePointerMove(e) {
    e.preventDefault();
    const s = this.state;
    const pos = this.getCanvasPos(e);
    const cueBall = s.balls.find((b) => b.id === 0);
    if (!cueBall || cueBall.pocketed) return;

    if (s.aiming && s.dragStart) {
      const dx = s.dragStart.x - pos.x;
      const dy = s.dragStart.y - pos.y;
      s.aimAngle = Math.atan2(dy, dx);
      s.aimPower = Math.min(Math.sqrt(dx * dx + dy * dy) / 10, MAX_POWER);
    } else {
      s.aimAngle = Math.atan2(pos.y - cueBall.y, pos.x - cueBall.x);
    }
  }

  handlePointerUp(e) {
    e.preventDefault();
    const s = this.state;
    if (!s.aiming || !s.canShoot || !s.gameActive) return;
    const cueBall = s.balls.find((b) => b.id === 0);
    if (!cueBall || cueBall.pocketed) return;

    if (s.aimPower > 0.5) {
      cueBall.vx = Math.cos(s.aimAngle) * s.aimPower;
      cueBall.vy = Math.sin(s.aimAngle) * s.aimPower;
      s.canShoot = false;
      s.lastShotPocketed = false;
      playSound(SOUNDS.hit);
    }
    s.aiming = false;
    s.dragStart = null;
    s.aimPower = 0;
  }
  spawnPocketParticles(x, y, color) {
    const s = this.state;
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: Math.random() * 4 + 2,
      });
    }
  }

  resetCueBall() {
    const s = this.state;
    const cue = s.balls.find((b) => b.id === 0);
    if (cue) {
      cue.pocketed = false;
      cue.x = s.table.x + s.table.w * 0.25;
      cue.y = s.table.y + s.table.h / 2;
      cue.vx = 0;
      cue.vy = 0;
    }
  }

  handlePocketed(ids) {
    const s = this.state;
    let pocketedBalls = false;
    let playPocket = false;

    for (const id of ids) {
      if (id === 0) {
        s.timeLeft = Math.max(0, s.timeLeft - CUE_BALL_PENALTY_TIME);
        s.score = Math.max(0, s.score - 50);
        s.combo = 0;
        s.comboText = "FOUL! -5s";
        s.comboTextTimer = 180;
        setTimeout(() => this.resetCueBall(), 500);
      } else {
        pocketedBalls = true;
        playPocket = true;
        const info = BALL_COLORS[id];
        if (info) {
          s.ballsPocketedDisplay.push({ id, color: info.fill, stripe: info.stripe });
          const ball = s.balls.find((b) => b.id === id);
          if (ball) this.spawnPocketParticles(ball.x, ball.y, info.fill);
        }
      }
    }

    if (playPocket) {
      playSound(SOUNDS.pocket);
    }

    if (pocketedBalls) {
      s.combo++;
      const basePoints = 100;
      const comboMultiplier = Math.min(s.combo, 5);
      const points = basePoints * comboMultiplier;
      s.score += points;

      s.timeLeft = Math.min(s.timeLeft + COMBO_TIME_BONUS, GAME_TIME + 30);

      if (s.combo > 1) {
        s.comboText = `COMBO x${s.combo}! +${points}pts +${COMBO_TIME_BONUS}s`;
      } else {
        s.comboText = `+${points} +${COMBO_TIME_BONUS}s`;
      }
      s.comboTextTimer = 180;
      s.lastShotPocketed = true;
    }

    if (s.balls.filter((b) => b.id !== 0 && !b.pocketed).length === 0) {
      const newBalls = initBalls(s.table, s.ballRadius);
      const cue = s.balls.find((b) => b.id === 0);
      s.balls = [cue, ...newBalls.filter((b) => b.id !== 0)];
      s.ballsPocketedDisplay = [];
    }

    this.updateScore(s.score);
    this.updateTime(Math.floor(s.timeLeft));
    this.updateCombo(s.combo);
    this.updateComboText(s.comboText);
    this.updatePocketed(s.ballsPocketedDisplay.slice());
  }

  updateScore(score) {
    this.ui.score = score;
    this.scoreEl.textContent = String(score);
  }

  updateTime(timeLeft) {
    this.ui.timeLeft = timeLeft;
    this.timeValue.textContent = String(timeLeft);
    if (timeLeft <= 10) {
      this.timeWrap.classList.remove("text-foreground");
      this.timeWrap.classList.add("text-accent", "animate-pulse");
    } else {
      this.timeWrap.classList.remove("text-accent", "animate-pulse");
      this.timeWrap.classList.add("text-foreground");
    }
  }

  updateComboText(text) {
    this.ui.comboText = text;
    if (!text) {
      this.comboTextWrap.classList.add("hidden");
      return;
    }
    this.comboTextWrap.classList.remove("hidden");
    this.comboTextValue.textContent = text;
    if (text.includes("FOUL")) {
      this.comboTextValue.classList.add("text-accent");
      this.comboTextValue.classList.remove("text-secondary");
    } else {
      this.comboTextValue.classList.add("text-secondary");
      this.comboTextValue.classList.remove("text-accent");
    }
  }

  updateCombo(combo) {
    this.ui.combo = combo;
    if (combo > 1) {
      this.comboWrap.classList.remove("hidden");
      this.comboValue.textContent = `COMBO x${combo}`;
    } else {
      this.comboWrap.classList.add("hidden");
    }
  }

  updatePocketed(list) {
    this.ui.pocketed = list;
    this.pocketedContainer.innerHTML = "";
    for (const b of list) {
      const ball = document.createElement("div");
      ball.className =
        "pocketed-ball w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full flex-shrink-0 border border-black/20";
      ball.style.background = `radial-gradient(circle at 35% 35%, ${b.color}dd, ${b.color})`;
      const num = document.createElement("span");
      num.className = "pocketed-ball-number";
      num.textContent = String(b.id);
      ball.appendChild(num);
      this.pocketedContainer.appendChild(ball);
    }
  }

  triggerGameOver() {
    if (this.ended) return;
    this.ended = true;
    playSound(SOUNDS.over);
    this.onGameOver(this.state.score);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  let cleanup = null;
  let bestScore = getBestScore();
  let lastScore = 0;
  let game = null;

  const setScreen = (screen) => {
    document.body.classList.toggle("is-playing", screen === "playing");
    document.body.classList.toggle("is-loading", screen === "loading");
    document.body.classList.toggle("is-start", screen === "start");
    if (cleanup) cleanup();
    app.innerHTML = "";

    if (screen === "loading") {
      const loading = createLoadingScreen(() => setScreen("start"));
      app.appendChild(loading.root);
      cleanup = () => loading.destroy();
      return;
    }

    if (screen === "start") {
      bestScore = getBestScore();
      const start = createStartScreen(bestScore, () => setScreen("playing"));
      app.appendChild(start.root);
      cleanup = () => start.destroy();
      return;
    }

    if (screen === "playing") {
      game = new PoolGame((score) => {
        saveBestScore(score);
        lastScore = score;
        bestScore = getBestScore();
        setScreen("gameover");
      });
      game.mount(app);
      cleanup = () => {
        if (game) game.destroy();
        game = null;
      };
      return;
    }

    if (screen === "gameover") {
      const over = createGameOverScreen(lastScore, bestScore, () => setScreen("playing"));
      app.appendChild(over.root);
      cleanup = () => over.destroy();
    }
  };

  setScreen("loading");
});
