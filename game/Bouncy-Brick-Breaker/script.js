(function () {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // Round rectangle fallback
  if (!ctx.roundRect) {
    ctx.roundRect = function (x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      this.beginPath();
      this.moveTo(x + r, y);
      this.lineTo(x + w - r, y);
      this.quadraticCurveTo(x + w, y, x + w, y + r);
      this.lineTo(x + w, y + h - r);
      this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      this.lineTo(x + r, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r);
      this.lineTo(x, y + r);
      this.quadraticCurveTo(x, y, x + r, y);
    };
  }

  // DOM Elements
  const scoreEl = document.getElementById("scoreEl");
  const highScoreEl = document.getElementById("highScoreEl");
  const startOverlay = document.getElementById("startOverlay");
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const finalScoreEl = document.getElementById("finalScoreEl");
  const powerupBadge = document.getElementById("powerupBadge");
  const btnLeft = document.getElementById("btnLeft");
  const btnRight = document.getElementById("btnRight");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const loadingProgress = document.getElementById("loadingProgress");

  // Game Constants
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 600;
  const GRAVITY = 0.4;
  const BOUNCE_FORCE = -11.5;
  const SUPER_BOUNCE_FORCE = -15; // From green/turbo power-ups
  const MOVE_SPEED = 6.5;
  const FRICTION = 0.85;

  const BRICK_WIDTH = 74;
  const BRICK_HEIGHT = 18;
  const ROW_GAP = 90; // vertical distance between rows
  const PLAYER_RADIUS = 12;

  // Game State
  let animationId = null;
  let gameRunning = false;
  let gameStarted = false;
  let score = 0;
  let highScore = parseInt(localStorage.getItem("bouncy-brick-high-score") || "0", 10);
  let keys = { left: false, right: false, space: false };
  let time = 0;

  // Objects
  let player = null;
  let bricks = [];
  let particles = [];
  let lasers = [];
  let powerups = [];

  // Scrolling & Juicy Screenshake
  let cameraY = 0;
  let startCameraY = 0;
  let shakeTime = 0;
  let shakeIntensity = 0;
  let nextRowY = CANVAS_HEIGHT - ROW_GAP; // Next Y to generate a brick row

  // Powerup Timer trackers
  let activePowerup = null; // 'laser', 'magnet'
  let powerupTimeLeft = 0;

  function setPixelRatio() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.scale(dpr, dpr);
  }

  // Screenshake trigger
  function triggerShake(intensity, duration) {
    shakeIntensity = intensity;
    shakeTime = duration;
  }

  // Spawning Particles
  function createExplosion(x, y, color, count = 12, speedMultiplier = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.5 + Math.random() * 4.5) * speedMultiplier;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 4,
        color: color,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03,
      });
    }
  }

  // Spawning Brick
  function createBrick(x, y, type, hits = 1) {
    return {
      x,
      y,
      w: BRICK_WIDTH,
      h: BRICK_HEIGHT,
      type, // 'normal', 'cracked', 'explode', 'unbreakable', 'spike', 'moving'
      hits,
      maxHits: hits,
      moveDir: Math.random() > 0.5 ? 1 : -1,
      moveSpeed: 1.2 + Math.random() * 1.5,
      startX: x,
      pulse: Math.random() * 10, // animation helper
    };
  }

  // Spawning Row
  function generateRow(y) {
    const columns = 6; // 6 slots of width 80 (total 480)
    const margin = (CANVAS_WIDTH - (columns * BRICK_WIDTH)) / 2;
    
    // Choose how many bricks to place in this row (typically 2 to 4)
    let count = 2 + Math.floor(Math.random() * 3);
    
    // Solid floor at the very bottom
    const isBottomRow = y > CANVAS_HEIGHT - 120;
    if (isBottomRow) {
      count = 6; // make a solid floor
    }

    const slots = Array.from({ length: columns }, (_, i) => i);
    // Shuffle slots
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    const placedIndices = slots.slice(0, count);

    placedIndices.forEach((colIndex) => {
      const x = margin + colIndex * BRICK_WIDTH;
      let type = "normal";
      let hits = 1;

      if (!isBottomRow) {
        const difficultyRatio = Math.min(1, Math.max(0, -y / 3000)); // scales 0 to 1 as we climb up to 3000px
        const typeRand = Math.random();

        if (typeRand < 0.15) {
          type = "unbreakable";
        } else if (typeRand < 0.28) {
          type = "explode";
        } else if (typeRand < 0.45) {
          type = "cracked";
          hits = 2;
        } else if (typeRand < 0.45 + (difficultyRatio * 0.22)) {
          // more spikes as player climbs
          type = "spike";
        } else if (typeRand < 0.8) {
          type = "moving";
        }
      }

      bricks.push(createBrick(x, y, type, hits));
    });
  }

  // Pre-fill initial screen
  function initBricks(isIdle = false) {
    bricks = [];
    nextRowY = CANVAS_HEIGHT - 60;
    
    if (isIdle) {
      // Spawn only the bottom solid floor row
      generateRow(nextRowY);
      nextRowY -= ROW_GAP;
    } else {
      // Generate rows down to -CANVAS_HEIGHT to ensure screen is full
      while (nextRowY > -CANVAS_HEIGHT) {
        generateRow(nextRowY);
        nextRowY -= ROW_GAP;
      }
    }
  }

  // Handle Spawning Power-ups from broken brick
  function spawnPowerupChance(x, y) {
    const rand = Math.random();
    if (rand > 0.35) return; // 35% chance

    let type = "coin";
    if (rand < 0.05) type = "shield";
    else if (rand < 0.13) type = "laser";
    else if (rand < 0.22) type = "magnet";

    powerups.push({
      x,
      y,
      w: 16,
      h: 16,
      vy: 1.5,
      type, // 'coin', 'shield', 'laser', 'magnet'
      pulse: 0,
    });
  }

  function resetGame(isIdle = false) {
    cameraY = 0;
    score = 0;
    time = 0;
    activePowerup = null;
    powerupTimeLeft = 0;
    gameStarted = !isIdle;
    powerupBadge.classList.add("hidden");

    keys.left = false;
    keys.right = false;
    keys.space = false;
    
    if (btnLeft) btnLeft.classList.remove("active");
    if (btnRight) btnRight.classList.remove("active");

    if (isIdle) {
      bricks = [];
    } else {
      initBricks(false);
    }

    // Player initial configuration
    if (isIdle) {
      player = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - PLAYER_RADIUS,
        vx: 0,
        vy: BOUNCE_FORCE,
        radius: PLAYER_RADIUS,
        hasShield: false,
        trail: [],
        lastShot: 0
      };
      cameraY = 0;
      startCameraY = 0;
    } else {
      player = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 120,
        vx: 0,
        vy: BOUNCE_FORCE,
        radius: PLAYER_RADIUS,
        hasShield: false,
        trail: [],
        lastShot: 0
      };
      startCameraY = player.y - CANVAS_HEIGHT * 0.45;
      cameraY = player.y - CANVAS_HEIGHT * 0.45;
    }

    particles = [];
    lasers = [];
    powerups = [];
    
    gameRunning = true;
    scoreEl.textContent = "0";
    highScoreEl.textContent = highScore;
  }

  function drawPlayer() {
    const x = player.x;
    const y = player.y - cameraY;

    // Trail rendering
    ctx.save();
    for (let i = 0; i < player.trail.length; i++) {
      const t = player.trail[i];
      const alpha = (i / player.trail.length) * 0.25;
      ctx.fillStyle = player.hasShield ? `rgba(168, 85, 247, ${alpha})` : `rgba(99, 102, 241, ${alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y - cameraY, player.radius * (i / player.trail.length), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Squash & Stretch Math
    ctx.save();
    ctx.translate(x, y);
    
    // Stretch along speed vector
    const speed = Math.abs(player.vy);
    const stretchFactor = Math.min(0.35, speed * 0.025);
    if (player.vy < 0) {
      // Climbing up - stretch vertically
      ctx.scale(1 - stretchFactor, 1 + stretchFactor);
    } else {
      // Falling down - squash/stretch
      ctx.scale(1 + stretchFactor * 0.5, 1 - stretchFactor * 0.5);
    }

    // Outer glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.hasShield ? "#a855f7" : "#6366f1";

    // Draw ball body gradient
    const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, player.radius);
    if (player.hasShield) {
      gradient.addColorStop(0, "#f3e8ff");
      gradient.addColorStop(1, "#c084fc");
    } else if (activePowerup === "laser") {
      gradient.addColorStop(0, "#ecfeff");
      gradient.addColorStop(1, "#22d3ee");
    } else {
      gradient.addColorStop(0, "#e0e7ff");
      gradient.addColorStop(1, "#6366f1");
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Shield bubble ring
    if (player.hasShield) {
      ctx.save();
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#a855f7";
      ctx.beginPath();
      ctx.arc(x, y, player.radius + 6 + Math.sin(time * 0.2) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawBricks() {
    bricks.forEach((b) => {
      const y = b.y - cameraY;
      if (y < -b.h - 50 || y > CANVAS_HEIGHT + 100) return; // frustum culling

      ctx.save();
      
      // Select styling based on brick type
      let fillStyle = "";
      let strokeStyle = "";
      let shadowColor = "";

      // Pulsing effect helper
      const pulseScale = 1 + Math.sin((time + b.pulse) * 0.1) * 0.05;

      switch (b.type) {
        case "normal":
          fillStyle = "#22c55e";
          strokeStyle = "#4ade80";
          shadowColor = "rgba(34, 197, 94, 0.4)";
          break;
        case "cracked":
          // Cracked fading colors depending on hits left
          if (b.hits === 2) {
            fillStyle = "#eab308";
            strokeStyle = "#fde047";
            shadowColor = "rgba(234, 179, 8, 0.4)";
          } else {
            fillStyle = "#b45309";
            strokeStyle = "#f59e0b";
            shadowColor = "rgba(180, 83, 9, 0.2)";
          }
          break;
        case "explode":
          fillStyle = "#ef4444";
          strokeStyle = "#f87171";
          shadowColor = "rgba(239, 68, 68, 0.5)";
          break;
        case "unbreakable":
          fillStyle = "#475569";
          strokeStyle = "#94a3b8";
          shadowColor = "rgba(71, 85, 105, 0.2)";
          break;
        case "spike":
          fillStyle = "#ec4899";
          strokeStyle = "#f472b6";
          shadowColor = "rgba(236, 72, 153, 0.5)";
          break;
        case "moving":
          fillStyle = "#06b6d4";
          strokeStyle = "#22d3ee";
          shadowColor = "rgba(6, 182, 212, 0.4)";
          break;
      }

      ctx.fillStyle = fillStyle;
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1.5;
      
      // Glowing bricks
      ctx.shadowBlur = b.type === "spike" || b.type === "explode" ? 12 : 6;
      ctx.shadowColor = shadowColor;

      // Draw brick container
      ctx.beginPath();
      ctx.roundRect(b.x, b.y - cameraY, b.w, b.h, 4);
      ctx.fill();
      ctx.stroke();

      // Additional cracked texture detail
      if (b.type === "cracked") {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 2;
        ctx.moveTo(b.x + 10, b.y - cameraY + 4);
        ctx.lineTo(b.x + b.w / 2, b.y - cameraY + 12);
        ctx.lineTo(b.x + b.w - 15, b.y - cameraY + 5);
        if (b.hits === 1) {
          // Extra cracks
          ctx.moveTo(b.x + 25, b.y - cameraY + 10);
          ctx.lineTo(b.x + 15, b.y - cameraY + 15);
        }
        ctx.stroke();
      }

      // Draw Spikes
      if (b.type === "spike") {
        ctx.fillStyle = "#ec4899";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        
        const spikeCount = 5;
        const spikeWidth = b.w / spikeCount;
        
        // Spikes on top
        for (let i = 0; i < spikeCount; i++) {
          ctx.beginPath();
          ctx.moveTo(b.x + i * spikeWidth, b.y - cameraY);
          ctx.lineTo(b.x + (i + 0.5) * spikeWidth, b.y - cameraY - 6);
          ctx.lineTo(b.x + (i + 1) * spikeWidth, b.y - cameraY);
          ctx.fill();
          ctx.stroke();
        }
      }

      ctx.restore();
    });
  }

  function drawLasers() {
    lasers.forEach((l) => {
      ctx.save();
      ctx.fillStyle = "#22d3ee";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#06b6d4";
      ctx.fillRect(l.x - 2, l.y - cameraY - 10, 4, 12);
      ctx.restore();
    });
  }

  function drawPowerups() {
    powerups.forEach((p) => {
      const y = p.y - cameraY;
      if (y < -30 || y > CANVAS_HEIGHT + 30) return;

      ctx.save();
      p.pulse += 0.15;
      const scale = 1 + Math.sin(p.pulse) * 0.15;

      ctx.translate(p.x + p.w / 2, y + p.h / 2);
      ctx.scale(scale, scale);

      ctx.shadowBlur = 10;
      let pColor = "";

      if (p.type === "coin") {
        pColor = "#fbbf24"; // Gold
        ctx.fillStyle = pColor;
        ctx.shadowColor = pColor;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 8px Orbitron";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", 0, 0);
      } else if (p.type === "shield") {
        pColor = "#a855f7"; // purple
        ctx.fillStyle = pColor;
        ctx.shadowColor = pColor;
        // Draw shield icon shape
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(6, -4);
        ctx.lineTo(4, 3);
        ctx.lineTo(0, 7);
        ctx.lineTo(-4, 3);
        ctx.lineTo(-6, -4);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === "laser") {
        pColor = "#06b6d4"; // cyan gun
        ctx.fillStyle = pColor;
        ctx.shadowColor = pColor;
        ctx.fillRect(-6, -2, 12, 4);
        ctx.fillRect(2, 2, 4, 4);
      } else if (p.type === "magnet") {
        pColor = "#ef4444"; // red/white magnet
        ctx.strokeStyle = pColor;
        ctx.shadowColor = pColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 5, Math.PI, 0, false);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  function drawParticles() {
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y - cameraY, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawGridBackground() {
    ctx.save();
    ctx.strokeStyle = "rgba(99, 102, 241, 0.035)";
    ctx.lineWidth = 1;
    
    // Vertical grid lines scrolling
    const gridSpacing = 40;
    const startX = 0;
    for (let x = startX; x < CANVAS_WIDTH; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Horizontal lines scrolling with camera
    const offset = (-cameraY) % gridSpacing;
    for (let y = offset; y < CANVAS_HEIGHT; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function handleBrickBreak(b, index) {
    // Generate break explosion particles
    let pColor = "#22c55e";
    if (b.type === "cracked") pColor = "#eab308";
    if (b.type === "explode") pColor = "#ef4444";
    if (b.type === "spike") pColor = "#ec4899";
    if (b.type === "moving") pColor = "#06b6d4";

    createExplosion(b.x + b.w / 2, b.y + b.h / 2, pColor, 15);
    triggerShake(4, 12);

    if (b.type === "explode") {
      // Explode and destroy nearby bricks (within 130px distance)
      createExplosion(b.x + b.w / 2, b.y + b.h / 2, "#ef4444", 25, 1.8);
      bricks.splice(index, 1); // delete first to prevent stack overflow loop
      
      const ex = b.x + b.w / 2;
      const ey = b.y + b.h / 2;
      
      for (let i = bricks.length - 1; i >= 0; i--) {
        const other = bricks[i];
        if (other.type === "unbreakable") continue;
        
        const ox = other.x + other.w / 2;
        const oy = other.y + other.h / 2;
        const dist = Math.hypot(ox - ex, oy - ey);
        if (dist < 130) {
          handleBrickBreak(other, i);
        }
      }
    } else {
      bricks.splice(index, 1);
    }

    // Spawn items
    spawnPowerupChance(b.x + b.w / 2, b.y + b.h / 2);
  }

  function fireLaser() {
    const now = Date.now();
    if (now - player.lastShot > 200) { // shot cooldown
      lasers.push({
        x: player.x,
        y: player.y
      });
      player.lastShot = now;
      
      // shooting micro-shiver
      triggerShake(1.5, 5);
      
      // small spark particles
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: player.x,
          y: player.y - player.radius,
          vx: (Math.random() - 0.5) * 4,
          vy: -8 - Math.random() * 3,
          radius: 1.5 + Math.random() * 2,
          color: "#22d3ee",
          alpha: 1,
          decay: 0.05,
        });
      }
    }
  }

  function checkCollisions() {
    const px = player.x;
    const py = player.y;
    const pr = player.radius;

    // Check brick hits
    for (let i = bricks.length - 1; i >= 0; i--) {
      const b = bricks[i];
      
      // Overlap calculation
      const closestX = Math.max(b.x, Math.min(px, b.x + b.w));
      const closestY = Math.max(b.y, Math.min(py, b.y + b.h));
      const distanceX = px - closestX;
      const distanceY = py - closestY;
      const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

      if (distanceSquared < pr * pr) {
        // Hitting spiked blocks
        if (b.type === "spike") {
          if (gameStarted) {
            if (player.hasShield) {
              player.hasShield = false;
              triggerShake(12, 20);
              createExplosion(px, py, "#c084fc", 18, 1.2);
              // bounce away
              player.vy = BOUNCE_FORCE;
              bricks.splice(i, 1);
            } else {
              gameOver();
              return;
            }
          } else {
            // Safe bounce off spikes when in idle screen
            player.vy = BOUNCE_FORCE;
            player.y = b.y - pr;
          }
          continue;
        }

        // Standard bounce checks when falling down
        if (player.vy >= 0 && py < b.y + 10) {
          // Trigger bounce
          player.vy = BOUNCE_FORCE;
          player.y = b.y - pr;
          
          triggerShake(2.5, 8);

          // Impact sparks
          let bounceColor = "#22c55e";
          if (b.type === "cracked") bounceColor = "#eab308";
          if (b.type === "explode") bounceColor = "#ef4444";
          if (b.type === "moving") bounceColor = "#06b6d4";
          if (b.type === "unbreakable") bounceColor = "#94a3b8";

          for (let pIndex = 0; pIndex < 6; pIndex++) {
            particles.push({
              x: px,
              y: b.y,
              vx: (Math.random() - 0.5) * 6,
              vy: -1 - Math.random() * 3,
              radius: 1 + Math.random() * 3,
              color: bounceColor,
              alpha: 0.9,
              decay: 0.04
            });
          }

          // Damage or break the block
          if (b.type !== "unbreakable" && gameStarted) {
            if (b.type === "cracked") {
              b.hits--;
              if (b.hits <= 0) {
                handleBrickBreak(b, i);
              } else {
                // Cracked dust particle
                createExplosion(b.x + b.w / 2, b.y + b.h / 2, "#eab308", 5, 0.5);
              }
            } else {
              handleBrickBreak(b, i);
            }
          }
        }
      }
    }

    // Check Laser collides with brick
    for (let lIndex = lasers.length - 1; lIndex >= 0; lIndex--) {
      const l = lasers[lIndex];
      let hit = false;
      
      for (let bIndex = bricks.length - 1; bIndex >= 0; bIndex--) {
        const b = bricks[bIndex];
        
        if (l.x >= b.x && l.x <= b.x + b.w && l.y >= b.y && l.y <= b.y + b.h) {
          // Hit!
          hit = true;
          if (b.type !== "unbreakable") {
            if (b.type === "cracked") {
              b.hits--;
              if (b.hits <= 0) {
                handleBrickBreak(b, bIndex);
              } else {
                createExplosion(l.x, b.y + b.h / 2, "#eab308", 4, 0.4);
              }
            } else {
              handleBrickBreak(b, bIndex);
            }
          } else {
            // Unbreakable sparkles
            createExplosion(l.x, b.y + b.h, "#94a3b8", 4, 0.4);
          }
          break;
        }
      }

      if (hit || l.y < cameraY - 50) {
        lasers.splice(lIndex, 1);
      }
    }

    // Magnet Pull logic
    const pullDistance = 120;

    // Check Powerup collection
    for (let pIndex = powerups.length - 1; pIndex >= 0; pIndex--) {
      const p = powerups[pIndex];
      
      // Magnet Pull Calculation
      if (activePowerup === "magnet" && p.type === "coin") {
        const dx = px - (p.x + 8);
        const dy = py - (p.y + 8);
        const dist = Math.hypot(dx, dy);
        if (dist < pullDistance) {
          p.x += (dx / dist) * 7.5;
          p.y += (dy / dist) * 7.5;
        }
      }

      // Check collision
      const closestX = Math.max(p.x, Math.min(px, p.x + p.w));
      const closestY = Math.max(p.y, Math.min(py, p.y + p.h));
      const distanceX = px - closestX;
      const distanceY = py - closestY;
      const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

      if (distanceSquared < pr * pr) {
        // Collected!
        const collectedType = p.type;
        powerups.splice(pIndex, 1);

        // Flashy sparkles
        createExplosion(px, py, collectedType === "coin" ? "#fbbf24" : collectedType === "shield" ? "#c084fc" : "#06b6d4", 12, 1);

        if (collectedType === "coin") {
          score += 150;
          scoreEl.textContent = score;
        } else if (collectedType === "shield") {
          player.hasShield = true;
        } else if (collectedType === "laser") {
          activePowerup = "laser";
          powerupTimeLeft = 450; // duration in animation frames (~7.5s)
          powerupBadge.textContent = "LASER ACTIVE";
          powerupBadge.classList.remove("hidden");
        } else if (collectedType === "magnet") {
          activePowerup = "magnet";
          powerupTimeLeft = 500; // ~8.3s
          powerupBadge.textContent = "MAGNET ACTIVE";
          powerupBadge.classList.remove("hidden");
        }
      }
    }
  }

  function gameOver() {
    gameRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    triggerShake(18, 30);
    
    // Massive final explosion
    createExplosion(player.x, player.y, player.hasShield ? "#c084fc" : "#6366f1", 40, 2);

    finalScoreEl.textContent = score;
    gameOverOverlay.classList.remove("hidden");
  }

  function gameLoop() {
    if (!gameRunning) return;

    time++;

    // Check if any key is pressed to active-start the gameplay
    if (!gameStarted) {
      if (keys.left || keys.right || keys.space || keys.up) {
        if (startOverlay.classList.contains("hidden")) {
          triggerStartGameplay();
        }
      }
    }

    // Horizontal Movement calculations
    if (gameStarted) {
      if (keys.left) {
        player.vx -= 0.65;
      } else if (keys.right) {
        player.vx += 0.65;
      } else {
        player.vx *= FRICTION;
      }

      // Clamp speed
      player.vx = Math.max(-MOVE_SPEED, Math.min(MOVE_SPEED, player.vx));
      player.x += player.vx;

      // Screen wrapping left & right borders
      if (player.x < -player.radius) {
        player.x = CANVAS_WIDTH + player.radius;
      } else if (player.x > CANVAS_WIDTH + player.radius) {
        player.x = -player.radius;
      }
    } else {
      player.vx = 0;
      player.x = CANVAS_WIDTH / 2;
    }

    // Apply gravity
    player.vy += GRAVITY;
    player.y += player.vy;

    // Bounce off bottom edge of canvas in idle state
    if (!gameStarted) {
      if (player.y > CANVAS_HEIGHT - player.radius) {
        player.y = CANVAS_HEIGHT - player.radius;
        player.vy = BOUNCE_FORCE;

        // Visual neon impacts
        for (let pIndex = 0; pIndex < 6; pIndex++) {
          particles.push({
            x: player.x,
            y: CANVAS_HEIGHT,
            vx: (Math.random() - 0.5) * 6,
            vy: -1 - Math.random() * 3,
            radius: 1 + Math.random() * 3,
            color: "#6366f1",
            alpha: 0.9,
            decay: 0.04
          });
        }
        triggerShake(1.5, 5);
      }
    }

    // Record trail positions
    player.trail.push({ x: player.x, y: player.y });
    if (player.trail.length > 8) {
      player.trail.shift();
    }

    // Handle active powerups timer depletion
    if (activePowerup) {
      powerupTimeLeft--;
      if (powerupTimeLeft <= 0) {
        activePowerup = null;
        powerupBadge.classList.add("hidden");
      }
    }

    // Fire laser if key is pressed and powerup is active
    if (activePowerup === "laser" && (keys.space || keys.up)) {
      fireLaser();
    }

    // Move moving bricks
    bricks.forEach((b) => {
      if (b.type === "moving") {
        b.x += b.moveSpeed * b.moveDir;
        if (b.x <= 0) {
          b.x = 0;
          b.moveDir = 1;
        } else if (b.x >= CANVAS_WIDTH - b.w) {
          b.x = CANVAS_WIDTH - b.w;
          b.moveDir = -1;
        }
      }
    });

    // Move lasers
    lasers.forEach((l) => {
      l.y -= 7.5; // fly speed
    });

    // Move powerups downward slightly (floating gravity effect)
    powerups.forEach((p) => {
      p.y += p.vy;
    });

    // Update particles decay
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    // Clean up out of boundary entities
    for (let i = bricks.length - 1; i >= 0; i--) {
      if (bricks[i].y - cameraY > CANVAS_HEIGHT) {
        bricks.splice(i, 1);
      }
    }
    for (let i = powerups.length - 1; i >= 0; i--) {
      if (powerups[i].y - cameraY > CANVAS_HEIGHT) {
        powerups.splice(i, 1);
      }
    }

    // Check collisions
    checkCollisions();

    // Scroll Camera
    if (gameStarted) {
      const targetCameraY = player.y - CANVAS_HEIGHT * 0.45;
      if (targetCameraY < cameraY) {
        // smooth scroll upward
        cameraY += (targetCameraY - cameraY) * 0.12;

        // Update scoring based on climbing distance
        const newScore = Math.max(0, Math.floor((startCameraY - cameraY) / 10));
        if (newScore > score) {
          score = newScore;
          scoreEl.textContent = score;
          if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem("bouncy-brick-high-score", String(highScore));
          }
        }
      }
    }

    // Fall death check
    if (player.y - cameraY > CANVAS_HEIGHT + 100) {
      if (player.hasShield) {
        // pop shield
        player.hasShield = false;
        player.vy = BOUNCE_FORCE * 1.25; // bounce up strongly
        triggerShake(10, 20);
        createExplosion(player.x, player.y, "#c084fc", 20, 1.5);
      } else {
        gameOver();
        return;
      }
    }

    // Spawning next rows of bricks above camera
    if (gameStarted) {
      while (nextRowY > cameraY - CANVAS_HEIGHT - 200) {
        generateRow(nextRowY);
        nextRowY -= ROW_GAP;
      }
    }

    // Render Canvas Frame
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dynamic screen shaking translation
    ctx.save();
    if (shakeTime > 0) {
      const dx = (Math.random() - 0.5) * shakeIntensity;
      const dy = (Math.random() - 0.5) * shakeIntensity;
      ctx.translate(dx, dy);
      shakeTime--;
    }

    // Draw grid background
    drawGridBackground();

    // Draw entities
    drawBricks();
    drawLasers();
    drawPowerups();
    drawParticles();
    drawPlayer();

    // Show blinking prompt if start menu is closed but gameplay hasn't started yet
    if (gameRunning && !gameStarted && startOverlay.classList.contains("hidden")) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${0.45 + Math.sin(time * 0.1) * 0.3})`;
      ctx.font = "bold 15px Orbitron";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#6366f1";
      ctx.fillText("PRESS ANY KEY TO START", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      ctx.font = "700 11px Rajdhani";
      ctx.fillStyle = "rgba(165, 180, 252, 0.7)";
      ctx.fillText("OR STEER TO BEGIN SYSTEM", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 25);
      ctx.restore();
    }

    ctx.restore();

    animationId = requestAnimationFrame(gameLoop);
  }

  function triggerStartGameplay() {
    if (gameStarted) return;
    
    // Transition to the actual interactive active game layout
    resetGame(false);
    
    startOverlay.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");
  }

  function startGame() {
    startOverlay.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");
    
    // Reset the game to the idle state if we are coming from game over (gameRunning was false)
    if (!gameRunning) {
      resetGame(true);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      gameLoop();
    }
  }

  // Event Listeners
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);

  // Keyboard controls
  document.addEventListener("keydown", function (e) {
    if (gameRunning && !gameStarted) {
      if (loadingOverlay && !loadingOverlay.classList.contains("hidden")) {
        return;
      }
      // Only start if startOverlay is hidden (meaning "START GAME" button was pressed)
      if (!startOverlay.classList.contains("hidden")) {
        return;
      }
      if (e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt" && e.key !== "Meta") {
        triggerStartGameplay();
      }
    }

    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
    if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      keys.space = true;
      keys.up = true;
      e.preventDefault(); // prevent scroll
    }
  });

  document.addEventListener("keyup", function (e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
    if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      keys.space = false;
      keys.up = false;
    }
  });

  // Mobile arrows touch controls
  function setKeyLeft(value) {
    if (value && gameRunning && !gameStarted) {
      if (startOverlay.classList.contains("hidden")) {
        triggerStartGameplay();
      }
    }
    keys.left = value;
    if (btnLeft) btnLeft.classList.toggle("active", value);
  }
  function setKeyRight(value) {
    if (value && gameRunning && !gameStarted) {
      if (startOverlay.classList.contains("hidden")) {
        triggerStartGameplay();
      }
    }
    keys.right = value;
    if (btnRight) btnRight.classList.toggle("active", value);
  }

  if (btnLeft) {
    btnLeft.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      setKeyLeft(true);
    });
    btnLeft.addEventListener("pointerup", function () { setKeyLeft(false); });
    btnLeft.addEventListener("pointerleave", function () { setKeyLeft(false); });
  }

  if (btnRight) {
    btnRight.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      setKeyRight(true);
    });
    btnRight.addEventListener("pointerup", function () { setKeyRight(false); });
    btnRight.addEventListener("pointerleave", function () { setKeyRight(false); });
  }

  // Laser screen tap autofire on mobile
  canvas.addEventListener("click", function () {
    if (!gameRunning) return;
    if (!gameStarted) {
      if (startOverlay.classList.contains("hidden")) {
        triggerStartGameplay();
      }
      return;
    }
    if (activePowerup === "laser") {
      fireLaser();
    }
  });

  // Window scaling adjustments
  window.addEventListener("resize", setPixelRatio);
  setPixelRatio();
  
  highScoreEl.textContent = highScore;

  // Fake Loading overlay simulation for premium arcade feeling
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 12 + 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadingInterval);
      setTimeout(() => {
        if (loadingOverlay) loadingOverlay.style.opacity = 0;
        setTimeout(() => {
          if (loadingOverlay) loadingOverlay.classList.add("hidden");
          // Initialize in idle/bouncing state when loading finishes!
          resetGame(true);
          gameLoop();
        }, 300);
      }, 500);
    }
    if (loadingProgress) {
      loadingProgress.style.width = progress + "%";
    }
  }, 80);
})();
