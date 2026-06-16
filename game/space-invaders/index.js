const scoreEl = document.querySelector("#scoreEl");
const levelEl = document.querySelector("#levelEl");
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const GAME_WIDTH = 1024;
const GAME_HEIGHT = 576;

let viewport = { scale: 1, offsetX: 0, offsetY: 0 };

const LB_KEY = "space_invaders_leaderboard_v1";

function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LB_KEY)) || [];
  } catch {
    return [];
  }
}

function setLeaderboard(list) {
  localStorage.setItem(LB_KEY, JSON.stringify(list));
}

function addScore(name, score) {
  const list = getLeaderboard();

  list.push({
    name: name?.trim() || "???",
    score,
    at: new Date().toISOString(),
  });

  list.sort((a, b) => b.score - a.score);
  setLeaderboard(list.slice(0, 10));
}

function renderLeaderboard() {
  const list = getLeaderboard();
  const ol = document.getElementById("leaderboardList");
  if (!ol) return;
  ol.innerHTML = "";
  list.forEach((row, idx) => {
    const li = document.createElement("li");
    li.textContent = `${row.name} — ${row.score}`;
    li.style.marginBottom = "2px";
    ol.appendChild(li);
  });
}

renderLeaderboard();

function updateViewport() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const gameRatio = GAME_WIDTH / GAME_HEIGHT;
  const winRatio = w / h;

  canvas.width = w;
  canvas.height = h;

  if (winRatio > gameRatio) {
    viewport.scale = h / GAME_HEIGHT;
    viewport.offsetX = Math.floor((w - GAME_WIDTH * viewport.scale) / 2);
    viewport.offsetY = 0;
  } else {
    viewport.scale = w / GAME_WIDTH;
    viewport.offsetX = 0;
    viewport.offsetY = Math.floor((h - GAME_HEIGHT * viewport.scale) / 2);
  }
}
updateViewport();
addEventListener("resize", updateViewport);

class Player {
  constructor() {
    this.velocity = { x: 0, y: 0 };
    this.image = null;

    this.width = 0;
    this.height = 0;
    this.position = { x: 0, y: 0 };
    this.rotation = 0;
    this.opacity = 1;

    const image = new Image();
    image.src = "./img/spaceship.png";
    image.onload = () => {
      const scale = 0.15;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: GAME_WIDTH / 2 - this.width / 2,
        y: GAME_HEIGHT - this.height - 20,
      };
    };
  }

  draw() {
    if (!this.image) return;

    c.save();
    c.globalAlpha = this.opacity;
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
    c.rotate(this.rotation);
    c.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );

    if (shieldActive) {
      c.beginPath();
      c.arc(0, 0, Math.max(this.width, this.height) * 0.7, 0, Math.PI * 2);
      c.strokeStyle = "cyan";
      c.lineWidth = 3;
      c.globalAlpha = 0.9;
      c.stroke();
      c.globalAlpha = this.opacity;
    }

    c.restore();
  }

  update() {
    if (!this.image) return;

    this.position.x += this.velocity.x;

    if (this.position.x < 0) this.position.x = 0;
    if (this.position.x > GAME_WIDTH - this.width) {
      this.position.x = GAME_WIDTH - this.width;
    }

    this.draw();
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = 4;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "red";
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Particle {
  constructor({ position, velocity, radius, color, fades }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.fades) this.opacity -= 0.01;
  }
}

class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.width = 3;
    this.height = 10;
  }

  draw() {
    c.fillStyle = "yellow";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Invader {
  constructor({ position }) {
    this.velocity = { x: 0, y: 0 };
    this.image = null;

    this.width = 0;
    this.height = 0;
    this.position = { x: 0, y: 0 };

    const image = new Image();
    image.src = "./img/invader.png";
    image.onload = () => {
      const scale = 1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  draw() {
    if (!this.image) return;
    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update({ velocity }) {
    if (!this.image) return;

    this.position.x += velocity.x;
    this.position.y += velocity.y;

    this.draw();
  }

  shoot(invaderProjectiles) {
    const projectileSpeed = Math.min(5 + (level - 1) * 0.5, 8);
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: { x: 0, y: projectileSpeed },
      })
    );
  }
}

class Grid {
  constructor() {
    this.position = { x: 0, y: 0 };
    const baseSpeed = 3 + (level - 1) * 0.5;
    this.velocity = { x: baseSpeed, y: 0 };
    this.invaders = [];

    const columns = Math.floor(Math.random() * 10 + 5);
    const rows = Math.floor(Math.random() * 5 + 2);

    this.width = columns * 30;

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.invaders.push(
          new Invader({
            position: {
              x: x * 30,
              y: y * 30,
            },
          })
        );
      }
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.y = 0;

    if (this.position.x + this.width >= GAME_WIDTH || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30;
    }
  }
}

class PowerUp {
  constructor({ position, type }) {
    (this.position = position),
      (this.width = 20),
      (this.height = 20),
      (this.type = type);
    this.velocity = {
      x: 0,
      y: 2,
    };
  }

  draw() {
    c.fillStyle = this.type === "shield" ? "cyan" : "gold";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.position.y += this.velocity.y;
    this.draw();
  }
}

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];
const powerUps = [];

const keys = {
  a: { pressed: false },
  d: { pressed: false },
  space: { pressed: false },
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
let game = { over: false, active: false };
let score = 0;
let level = 1;

let levelHasSpawned = false;
let nextLevelTimer = null;

// Power-Ups
let shieldActive = false;
let shieldTimer = null;
let bonusActive = false;
let bonusTimer = null;

function showPowerUpShield() {
  const el = document.getElementById("shield");
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 2000);
}

function showPowerUpMultiplier() {
  const el = document.getElementById("ptsMultiplier");
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 2000);
}

function activateShield() {
  clearTimeout(shieldTimer);
  shieldActive = true;
  showPowerUpShield();
  shieldTimer = setTimeout(() => {
    shieldActive = false;
  }, 5000);
}

function activateBonus() {
  clearTimeout(bonusTimer);
  bonusActive = true;
  showPowerUpMultiplier();
  bonusTimer = setTimeout(() => {
    bonusActive = false;
  }, 5000);
}

// Victory detection and level progression
function checkVictory() {
  if (!game.active || game.over || !levelHasSpawned) return;

  const totalInvaders = grids.reduce(
    (total, grid) => total + grid.invaders.length,
    0
  );

  if (totalInvaders === 0 && grids.length === 0) {
    if (nextLevelTimer) return;
    playVictorySound();
    showNextLevelScreen();
    nextLevelTimer = setTimeout(() => {
      nextLevelTimer = null;
      nextLevel();
    }, 2000);
  }
}

function playVictorySound() {
  const music = document.getElementById("victory");
  if (music) {
    music.currentTime = 0;
    music.play().catch((err) => console.warn("Victory sound failed:", err));
    music.volume = 0.7;
  }
}

function showNextLevelScreen() {
  document.getElementById("nextLevel").style.display = "block";
  document.getElementById("nextLevelPoints").style.display = "block";
}

function hideNextLevelScreen() {
  document.getElementById("nextLevel").style.display = "none";
  document.getElementById("nextLevelPoints").style.display = "none";
}

function nextLevel() {
  const bonus = 500 * level;
  score += bonus;
  scoreEl.innerHTML = score;

  level++;
  levelEl.innerHTML = level;
  hideNextLevelScreen();

  // Reset for next level
  frames = 1;
  randomInterval = Math.max(
    200,
    Math.floor(Math.random() * 500 + 500) - level * 50
  ); // Shorter intervals between spawns

  // Spawn first grid of new level immediately
  grids.length = 0;
  grids.push(new Grid());
  levelHasSpawned = true;
}

// background particles
for (let i = 0; i < 100; i++) {
  particles.push(
    new Particle({
      position: {
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
      },
      velocity: { x: 0, y: 0.3 },
      radius: Math.random() * 2,
      color: "white",
    })
  );
}

function createParticles({ object, color, fades }) {
  for (let i = 0; i < 15; i++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * 3,
        color: color || "#BAA0DE",
        fades: true,
      })
    );
  }
}

function showGameOver() {
  document.getElementById("gameOver").style.display = "block";
  document.getElementById("gameOverBtn").style.display = "block";
  document.getElementById("leaderboard").style.display = "block";

  document.getElementById("finalScore").textContent = score;
  document.getElementById("saveScoreUI").style.display = "block";
  document.getElementById("saveBackdrop").style.display = "block";

  const nameEl = document.getElementById("playerName");
  nameEl.value = "";
  nameEl.focus();
}

function animate() {
  if (!game.active) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.setTransform(
      viewport.scale,
      0,
      0,
      viewport.scale,
      viewport.offsetX,
      viewport.offsetY
    );

    particles.forEach((p) => {
      p.update();
      if (p.position.y - p.radius >= GAME_HEIGHT) {
        p.position.x = Math.random() * GAME_WIDTH;
        p.position.y = -p.radius;
      }
    });

    if (player.image) {
      player.draw();
    } else {
      c.fillStyle = "white";
      c.fillRect(GAME_WIDTH / 2 - 10, GAME_HEIGHT - 40, 20, 20);
    }

    requestAnimationFrame(animate);
    return;
  }

  requestAnimationFrame(animate);

  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  c.setTransform(
    viewport.scale,
    0,
    0,
    viewport.scale,
    viewport.offsetX,
    viewport.offsetY
  );

  c.fillStyle = "black";
  c.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // background particles
  particles.forEach((particle, i) => {
    if (particle.position.y - particle.radius >= GAME_HEIGHT) {
      particle.position.x = Math.random() * GAME_WIDTH;
      particle.position.y = -particle.radius;
    }

    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(i, 1);
      }, 0);
    } else {
      particle.update();
    }
  });

  // invader bullets
  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (
      invaderProjectile.position.y + invaderProjectile.height >=
      GAME_HEIGHT
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
      }, 0);
    } else {
      invaderProjectile.update();
    }

    // hit player
    if (
      invaderProjectile.position.y + invaderProjectile.height >=
        player.position.y &&
      invaderProjectile.position.x + invaderProjectile.width >=
        player.position.x &&
      invaderProjectile.position.x <= player.position.x + player.width
    ) {
      if (shieldActive) {
        setTimeout(() => {
          invaderProjectiles.splice(index, 1);
        }, 0);
        createParticles({ object: player, color: "cyan", fades: true });
        return;
      }

      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
        player.opacity = 0;
        game.over = true;

        const music = document.getElementById("explosion");
        music.currentTime = 0;
        music.play().catch((err) => console.warn("Autoplay blocked:", err));
        music.volume = 5.0;
      }, 0);

      setTimeout(() => {
        game.active = false;
        showGameOver();
      }, 1000);

      createParticles({
        object: player,
        color: "white",
        fades: true,
      });
    }
  });

  // player bullets
  projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius <= 0) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    } else {
      projectile.update();
    }
  });

  // grids + invaders
  grids.forEach((grid, gridIndex) => {
    grid.update();

    // More frequent shooting based on level
    const shootingFrequency = Math.max(50, 100 - level * 10);
    if (frames % shootingFrequency === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      );
    }

    grid.invaders.forEach((invader, i) => {
      invader.update({ velocity: grid.velocity });

      // player projectile vs invader
      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <=
            invader.position.x + invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find(
              (invader2) => invader2 === invader
            );
            const projectileFound = projectiles.find(
              (projectile2) => projectile2 === projectile
            );

            if (invaderFound && projectileFound) {
              let points = 100;
              if (bonusActive) points *= 2;

              score += points;
              scoreEl.innerHTML = score;

              createParticles({
                object: invader,
                fades: true,
              });

              grid.invaders.splice(i, 1);
              projectiles.splice(j, 1);

              if (grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0];
                const lastInvader = grid.invaders[grid.invaders.length - 1];

                grid.width =
                  lastInvader.position.x -
                  firstInvader.position.x +
                  lastInvader.width;
                grid.position.x = firstInvader.position.x;
              } else {
                grids.splice(gridIndex, 1);
              }

              // --- POWER-UP DROP ---
              if (Math.random() < 0.03) {
                const type = Math.random() < 0.5 ? "shield" : "points";
                powerUps.push(
                  new PowerUp({
                    position: {
                      x: invader.position.x + invader.width / 2 - 10,
                      y: invader.position.y,
                    },
                    type,
                  })
                );
              }
            }
          }, 0);
        }
      });
    });
  });

  // POWER-UPS: update, cull, and collect
  powerUps.forEach((p, i) => {
    p.update();

    // remove if off-screen
    if (p.position.y > GAME_HEIGHT) {
      setTimeout(() => powerUps.splice(i, 1), 0);
      return;
    }

    // AABB collision with player
    if (
      p.position.x < player.position.x + player.width &&
      p.position.x + p.width > player.position.x &&
      p.position.y < player.position.y + player.height &&
      p.position.y + p.height > player.position.y
    ) {
      if (p.type === "shield") {
        activateShield();
        createParticles({ object: player, color: "cyan", fades: true });
      } else if (p.type === "points") {
        activateBonus();
        createParticles({ object: player, color: "gold", fades: true });
      }
      setTimeout(() => powerUps.splice(i, 1), 0);
    }
  });

  // Check for victory condition
  checkVictory();

  // player movement
  if (keys.a.pressed && !keys.d.pressed) {
    player.velocity.x = -5;
    player.rotation = -0.15;
  } else if (keys.d.pressed && !keys.a.pressed) {
    player.velocity.x = 5;
    player.rotation = 0.15;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  player.update();

  // spawn new grid of invaders
  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    frames = 0;
    randomInterval = Math.max(
      200,
      Math.floor(Math.random() * 500 + 500) - level * 50
    );
  }

  frames++;
}

animate();

document.getElementById("start").addEventListener("click", () => {
  document.getElementById("start").style.display = "none";
  document.getElementById("leaderboard").style.display = "none";
  document.getElementById("controlsHint").style.display = "none";

  score = 0;
  level = 1;
  scoreEl.innerHTML = score;
  levelEl.innerHTML = level;
  hideNextLevelScreen();
  game.over = false;
  game.active = true;

  grids.length = 0;
  invaderProjectiles.length = 0;
  projectiles.length = 0;

  player.opacity = 1;

  frames = 1;
  randomInterval = Math.max(
    200,
    Math.floor(Math.random() * 500 + 500) - level * 50
  );
  grids.push(new Grid());
  levelHasSpawned = true;

  const music = document.getElementById("backgroundMusic");
  music.currentTime = 0;
  music.play().catch((err) => console.warn("Autoplay blocked:", err));
  music.volume = 0.5;
});

document.getElementById("saveScoreBtn").addEventListener("click", () => {
  const name = document.getElementById("playerName").value || "Player";
  addScore(name, score);
  renderLeaderboard();

  document.getElementById("saveScoreUI").style.display = "none";
  document.getElementById("saveBackdrop").style.display = "none";
});

document.getElementById("playerName").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("saveScoreBtn").click();
});

document.getElementById("clearLB")?.addEventListener("click", () => {
  localStorage.removeItem(LB_KEY);
  renderLeaderboard();
});

let canShoot = true;

addEventListener("keydown", (e) => {
  if (game.over || !game.active) return;

  const { key } = e;
  switch (key) {
    case "a":
    case "ArrowLeft":
      keys.a.pressed = true;
      break;
    case "d":
    case "ArrowRight":
      keys.d.pressed = true;
      break;
    case " ":
      shoot();
      break;
  }
});

addEventListener("keyup", (e) => {
  if (!game.active) return;
  const { key } = e;
  switch (key) {
    case "a":
    case "ArrowLeft":
      keys.a.pressed = false;
      break;
    case "d":
    case "ArrowRight":
      keys.d.pressed = false;
      break;
    case " ":
      keys.space.pressed = false;
      break;
  }
});

function shoot() {
  if (game.over || !game.active) return;
  if (!canShoot) return;
  canShoot = false;
  setTimeout(() => {
    canShoot = true;
  }, 100);

  keys.space.pressed = true;
  projectiles.push(
    new Projectile({
      position: {
        x: player.position.x + player.width / 2,
        y: player.position.y,
      },
      velocity: { x: 0, y: -10 },
    })
  );
  const music = document.getElementById("laser");
  music.currentTime = 0;
  music.play().catch((err) => console.warn("Autoplay blocked:", err));
  music.volume = 0.25;
}

// Touch controls for mobile viewports
const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");
const btnFire = document.getElementById("btnFire");

if (btnLeft && btnRight && btnFire) {
  btnLeft.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys.a.pressed = true;
  }, { passive: false });
  btnLeft.addEventListener("touchend", (e) => {
    e.preventDefault();
    keys.a.pressed = false;
  }, { passive: false });
  btnLeft.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    keys.a.pressed = false;
  }, { passive: false });

  btnRight.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys.d.pressed = true;
  }, { passive: false });
  btnRight.addEventListener("touchend", (e) => {
    e.preventDefault();
    keys.d.pressed = false;
  }, { passive: false });
  btnRight.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    keys.d.pressed = false;
  }, { passive: false });

  btnFire.addEventListener("touchstart", (e) => {
    e.preventDefault();
    shoot();
  }, { passive: false });
  btnFire.addEventListener("touchend", (e) => {
    e.preventDefault();
    keys.space.pressed = false;
  }, { passive: false });
}
