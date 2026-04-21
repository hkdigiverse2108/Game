// script.js - Cartoon Snake Game

let canvas, ctx;
let gameInterval;
let isGameActive = false;
let isPaused = false;
let currentSpeed = 130;
let score = 0;
let highScore = 0;
let playerName = "CARTOON HERO";
let soundEnabled = true;
let swipeHandlersBound = false;

let snake = [];
let food = { x: 0, y: 0 };
let direction = "right";
let nextDirection = "right";
const gridSize = 20;
let cellSize;

const eatSound = new Audio("./audio/snake_bite.mp3");
const deathSound = new Audio("./audio/game_over.mp3");

eatSound.volume = 0.3;
deathSound.volume = 0.7;
eatSound.preload = "auto";
deathSound.preload = "auto";

const bgImage = new Image();
bgImage.src = "./images/mat.png";

const overlay = document.getElementById("gameOverlay");
const finalScoreSpan = document.getElementById("finalScoreDisplay");
const highScoreSpan = document.getElementById("displayHighScoreSpan");

function updateViewportHeight() {
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty("--safe-height", `${viewportHeight}px`);
}

let loadPercent = 0;
const loadInterval = setInterval(() => {
    loadPercent += Math.random() * 12 + 5;

    if (loadPercent >= 100) {
        loadPercent = 100;
        clearInterval(loadInterval);
        setTimeout(() => {
            document.getElementById("loadingScreen").style.opacity = "0";
            setTimeout(() => {
                document.getElementById("loadingScreen").style.display = "none";
                document.getElementById("settingsScreen").classList.remove("d-none");
            }, 300);
        }, 200);
    }

    document.getElementById("loadFill").style.width = `${Math.min(loadPercent, 100)}%`;
    document.getElementById("loadPercent").innerText = `${Math.floor(Math.min(loadPercent, 100))}%`;
}, 70);

function setupSwipe() {
    if (swipeHandlersBound || !canvas) return;
    swipeHandlersBound = true;

    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    canvas.addEventListener("touchend", (e) => {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 30) setDirection("right");
            else if (dx < -30) setDirection("left");
        } else {
            if (dy > 30) setDirection("down");
            else if (dy < -30) setDirection("up");
        }
    }, { passive: true });
}

function initCanvas() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    updateViewportHeight();

    const isSmallScreen = window.innerWidth <= 550;
    const arena = document.querySelector(".arena");
    const wrapper = document.querySelector(".game-wrapper");
    const header = document.querySelector(".game-header");
    const mobileActions = document.querySelector(".mobile-actions");
    const arenaStyles = arena ? window.getComputedStyle(arena) : null;
    const wrapperStyles = wrapper ? window.getComputedStyle(wrapper) : null;
    const wrapperGap = wrapperStyles ? parseFloat(wrapperStyles.gap) || 0 : 0;
    const arenaPaddingX = arenaStyles
        ? parseFloat(arenaStyles.paddingLeft) + parseFloat(arenaStyles.paddingRight)
        : 0;
    const arenaPaddingY = arenaStyles
        ? parseFloat(arenaStyles.paddingTop) + parseFloat(arenaStyles.paddingBottom)
        : 0;
    const wrapperPaddingX = wrapperStyles
        ? parseFloat(wrapperStyles.paddingLeft) + parseFloat(wrapperStyles.paddingRight)
        : 0;
    const availableWidth = wrapper
        ? wrapper.clientWidth - wrapperPaddingX - (isSmallScreen ? 0 : arenaPaddingX)
        : window.innerWidth - 32;
    const headerWidth = header ? header.clientWidth : availableWidth;
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const mobileActionsHeight = mobileActions && window.getComputedStyle(mobileActions).display !== "none"
        ? mobileActions.getBoundingClientRect().height + 8
        : 0;
    const wrapperPaddingY = wrapperStyles
        ? parseFloat(wrapperStyles.paddingTop) + parseFloat(wrapperStyles.paddingBottom)
        : 0;
    const minimumGrid = isSmallScreen ? gridSize * 8 : gridSize * 10;
    const widthBoundSize = Math.min(availableWidth, headerWidth);
    const layoutSafetySpace = isSmallScreen ? 36 : 48;
    const availableHeight = viewportHeight - headerHeight - mobileActionsHeight - wrapperPaddingY - wrapperGap - layoutSafetySpace;
    const sizeBound = Math.min(widthBoundSize, availableHeight);
    const snapSize = Math.max(minimumGrid, Math.floor(sizeBound / gridSize) * gridSize);

    canvas.width = snapSize;
    canvas.height = snapSize;
    canvas.style.setProperty("--canvas-size", `${snapSize}px`);
    cellSize = snapSize / gridSize;

    setupSwipe();
}

function drawCartoonGame() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgImage.complete && bgImage.naturalWidth > 0) {
        ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height, 0, 0, canvas.width, canvas.height);
    } else {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, "#2d6a4f");
        grad.addColorStop(1, "#1b4332");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    for (let i = 0; i < 150; i++) {
        ctx.fillStyle = `rgba(200, 160, 100, ${Math.random() * 0.15})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.shadowBlur = 6;
    ctx.shadowColor = "#cc8844";

    const appleGrad = ctx.createRadialGradient(
        food.x * cellSize + 5, food.y * cellSize + 5, 3,
        food.x * cellSize + 12, food.y * cellSize + 12, 12
    );
    appleGrad.addColorStop(0, "#ff6b4a");
    appleGrad.addColorStop(1, "#e74c3c");
    ctx.fillStyle = appleGrad;
    ctx.beginPath();
    ctx.ellipse(
        food.x * cellSize + cellSize / 2,
        (food.y * cellSize + cellSize / 3) - 3,
        cellSize / 2 - 2,
        cellSize / 2 - 1.5,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.ellipse(food.x * cellSize + cellSize - 8, food.y * cellSize + 6, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6ab04c";
    ctx.beginPath();
    ctx.moveTo(food.x * cellSize + cellSize / 2, food.y * cellSize + 4);
    ctx.quadraticCurveTo(
        food.x * cellSize + cellSize / 2 + 5,
        food.y * cellSize,
        food.x * cellSize + cellSize / 2 + 8,
        food.y * cellSize + 5
    );
    ctx.fill();
    ctx.restore();

    snake.forEach((seg, idx) => {
        const x = seg.x * cellSize;
        const y = seg.y * cellSize;
        const radius = cellSize * 0.25;

        ctx.save();
        ctx.shadowBlur = 3;
        ctx.shadowColor = "rgba(100, 50, 0, 0.3)";

        const snakeGrad = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
        if (idx === 0) {
            snakeGrad.addColorStop(0, "#82cc6e");
            snakeGrad.addColorStop(1, "#4a9e2f");
        } else {
            snakeGrad.addColorStop(0, "#6ab04c");
            snakeGrad.addColorStop(1, "#3b7a1f");
        }

        ctx.fillStyle = snakeGrad;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + cellSize - radius, y);
        ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + radius);
        ctx.lineTo(x + cellSize, y + cellSize - radius);
        ctx.quadraticCurveTo(x + cellSize, y + cellSize, x + cellSize - radius, y + cellSize);
        ctx.lineTo(x + radius, y + cellSize);
        ctx.quadraticCurveTo(x, y + cellSize, x, y + cellSize - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        if (idx === 0) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(x + cellSize - 7, y + 7, 3, 0, Math.PI * 2);
            ctx.arc(x + 7, y + 7, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#2c3e50";
            ctx.beginPath();
            ctx.arc(x + cellSize - 8, y + 6, 1.5, 0, Math.PI * 2);
            ctx.arc(x + 6, y + 6, 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#e74c3c";
            ctx.beginPath();
            ctx.moveTo(x + cellSize - 4, y + 12);
            ctx.lineTo(x + cellSize, y + 14);
            ctx.lineTo(x + cellSize - 4, y + 16);
            ctx.fill();
        }

        ctx.restore();
    });
}

function placeRandomFood() {
    let valid = false;
    while (!valid) {
        food.x = Math.floor(Math.random() * gridSize);
        food.y = Math.floor(Math.random() * gridSize);
        valid = !snake.some((segment) => segment.x === food.x && segment.y === food.y);
    }
}

function showGameOverModal(finalScore) {
    finalScoreSpan.innerText = finalScore;
    highScoreSpan.innerText = highScore;

    let message = "Better luck next time, brave adventurer!";
    let iconLeft = "🍂";
    let iconRight = "🌵";

    if (finalScore >= highScore && finalScore > 0) {
        message = "✨ NEW JUNGLE RECORD! ✨ You are legendary!";
        iconLeft = "👑";
        iconRight = "🏆";
    } else if (highScore > 0 && finalScore >= highScore * 0.8) {
        message = "⭐ Great run! You were very close to the record!";
        iconLeft = "🌟";
        iconRight = "🌴";
    } else if (finalScore >= 100) {
        message = "🌱 Nice run! One more try and you will go even farther.";
        iconLeft = "🌿";
        iconRight = "🍃";
    }

    document.getElementById("jungleMessageBox").innerHTML = `
        <span>${iconLeft}</span>
        <span id="dynamicMessage">${message}</span>
        <span>${iconRight}</span>
    `;

    overlay.classList.remove("d-none");
}

function hideGameOverModal() {
    overlay.classList.add("d-none");
}

function gameOver() {
    if (soundEnabled) {
        deathSound.currentTime = 0;
        deathSound.play();
    }

    isGameActive = false;
    if (gameInterval) clearInterval(gameInterval);
    showGameOverModal(score);
}

function updateGame() {
    if (!isGameActive || isPaused) return;

    direction = nextDirection;
    const head = { ...snake[0] };

    switch (direction) {
        case "up":
            head.y--;
            break;
        case "down":
            head.y++;
            break;
        case "left":
            head.x--;
            break;
        case "right":
            head.x++;
            break;
    }

    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        gameOver();
        return;
    }

    for (const seg of snake) {
        if (seg.x === head.x && seg.y === head.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        if (soundEnabled) {
            eatSound.currentTime = 0;
            eatSound.play();
        }

        score += 10;
        document.getElementById("currentScore").innerText = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("cartoonSnakeHigh", highScore);
            document.getElementById("settingsHighScore").innerText = highScore;
            document.getElementById("gameHighScore").innerText = highScore;
            highScoreSpan.innerText = highScore;
        }

        placeRandomFood();
    } else {
        snake.pop();
    }

    drawCartoonGame();
}

function resetGame() {
    hideGameOverModal();
    score = 0;
    isPaused = false;
    isGameActive = true;

    document.getElementById("currentScore").innerText = "0";
    document.getElementById("pauseBtn").innerHTML = "⏸";
    document.getElementById("pauseBtnMobile").innerHTML = "⏸";

    snake = [
        { x: 10, y: 18 },
        { x: 9, y: 18 },
        { x: 8, y: 18 }
    ];

    direction = "right";
    nextDirection = "right";
    placeRandomFood();

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, currentSpeed);
    drawCartoonGame();
}

function togglePause() {
    if (!isGameActive) return;

    isPaused = !isPaused;
    const pauseLabel = isPaused ? "▶" : "⏸";
    document.getElementById("pauseBtn").innerHTML = pauseLabel;
    document.getElementById("pauseBtnMobile").innerHTML = pauseLabel;

    if (!isPaused) updateGame();
}

function exitToMenu() {
    if (gameInterval) clearInterval(gameInterval);
    isGameActive = false;
    hideGameOverModal();
    document.getElementById("gameScreen").classList.add("d-none");
    document.getElementById("settingsScreen").classList.remove("d-none");
}

function setDirection(newDir) {
    if (!isGameActive || isPaused) return;
    if (newDir === "up" && direction !== "down") nextDirection = "up";
    else if (newDir === "down" && direction !== "up") nextDirection = "down";
    else if (newDir === "left" && direction !== "right") nextDirection = "left";
    else if (newDir === "right" && direction !== "left") nextDirection = "right";
}

function startGame() {
    playerName = document.getElementById("playerName").value.trim() || "CARTOON HERO";
    soundEnabled = document.getElementById("soundToggle").checked;
    const activeDiff = document.querySelector(".difficulty-btn.active");
    currentSpeed = parseInt(activeDiff.dataset.speed, 10);

    highScore = parseInt(localStorage.getItem("cartoonSnakeHigh") || "0", 10);
    document.getElementById("settingsHighScore").innerText = highScore;
    document.getElementById("gameHighScore").innerText = highScore;
    document.getElementById("gamePlayerName").innerText = playerName;
    highScoreSpan.innerText = highScore;

    document.getElementById("settingsScreen").classList.add("d-none");
    document.getElementById("gameScreen").classList.remove("d-none");

    initCanvas();
    resetGame();
}

function resizeGameLayout() {
    updateViewportHeight();

    if (!document.getElementById("gameScreen").classList.contains("d-none")) {
        initCanvas();
        drawCartoonGame();
    }
}

document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".difficulty-btn").forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");
    });
});

document.getElementById("startGameBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", togglePause);
document.getElementById("restartBtn").addEventListener("click", resetGame);
document.getElementById("exitBtn").addEventListener("click", exitToMenu);
document.getElementById("pauseBtnMobile").addEventListener("click", togglePause);
document.getElementById("restartBtnMobile").addEventListener("click", resetGame);
document.getElementById("exitBtnMobile").addEventListener("click", exitToMenu);
document.getElementById("gameoverRestart").addEventListener("click", resetGame);
document.getElementById("gameoverExit").addEventListener("click", exitToMenu);

window.addEventListener("keydown", (e) => {
    if (document.getElementById("gameScreen").classList.contains("d-none")) return;

    const key = e.key.toLowerCase();
    if (key === "arrowup" || key === "w") setDirection("up");
    else if (key === "arrowdown" || key === "s") setDirection("down");
    else if (key === "arrowleft" || key === "a") setDirection("left");
    else if (key === "arrowright" || key === "d") setDirection("right");
    else if (key === " " || key === "p") {
        e.preventDefault();
        togglePause();
        return;
    } else if (key === "escape" && !overlay.classList.contains("d-none")) {
        hideGameOverModal();
        return;
    }

    e.preventDefault();
});

window.addEventListener("resize", resizeGameLayout);
window.visualViewport?.addEventListener("resize", resizeGameLayout);

overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hideGameOverModal();
});

bgImage.onload = () => {
    if (isGameActive) drawCartoonGame();
};

window.addEventListener("load", () => {
    updateViewportHeight();
    highScore = parseInt(localStorage.getItem("cartoonSnakeHigh") || "0", 10);
    document.getElementById("settingsHighScore").innerText = highScore;
    document.getElementById("gameHighScore").innerText = highScore;
    highScoreSpan.innerText = highScore;
});
