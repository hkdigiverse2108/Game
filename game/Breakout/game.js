// SCREEN MANAGEMENT
const loadingScreen = document.getElementById("loading-screen");
const levelScreen = document.getElementById("level-screen");
const gameScreen = document.getElementById("game-screen");

function showScreen(screen) {
    loadingScreen.classList.remove('active');
    levelScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    screen.classList.add('active');
}

// LOADING LOGIC
let progress = 0;
const playBtn = document.getElementById("loading-play-btn");
let loadingInterval = setInterval(() => {
    progress += 5;
    document.getElementById("progress-bar").style.width = progress + "%";
    if (progress >= 100) {
        clearInterval(loadingInterval);
        document.getElementById("progress-wrapper").style.display = "none";
        playBtn.style.display = "block";
    }
}, 50);

playBtn.addEventListener("click", () => {
    initLevelScreen();
    showScreen(levelScreen);
});

// LEVEL DATA & UI
const TOTAL_LEVELS = 60;
let levelData = JSON.parse(localStorage.getItem('breakoutLevels')) || { 1: { unlocked: true, stars: 0 } };

function getLevelLayout() {
    const isMobileWidth = window.innerWidth <= 576;
    const isCompactHeight = window.innerHeight <= 760;

    if (isMobileWidth) {
        return { columns: 4, levelsPerPage: 20 };
    }

    if (isCompactHeight) {
        return { columns: 5, levelsPerPage: 20 };
    }

    return { columns: 5, levelsPerPage: 30 };
}

function initLevelScreen() {
    let slider = document.querySelector('.level-slider');
    slider.innerHTML = '';
    const { columns, levelsPerPage } = getLevelLayout();
    let totalPages = Math.ceil(TOTAL_LEVELS / levelsPerPage);

    levelScreen.style.setProperty("--level-columns", columns);

    // adjust slider width to hold all pages
    slider.style.width = (totalPages * 100) + "%";

    for (let p = 1; p <= totalPages; p++) {
        let pageDiv = document.createElement("div");
        pageDiv.classList.add("level-page");
        pageDiv.style.width = (100 / totalPages) + "%";

        let startLvl = (p - 1) * levelsPerPage + 1;
        let endLvl = Math.min(startLvl + levelsPerPage - 1, TOTAL_LEVELS);

        for (let i = startLvl; i <= endLvl; i++) {
            let btn = document.createElement("div");
            btn.classList.add("level-btn");
            let data = levelData[i];

            if (data && data.unlocked) {
                btn.classList.add("unlocked");
                btn.innerHTML = `${i} <div class="level-stars">${getStarsHTML(data.stars)}</div>`;
                btn.addEventListener("click", () => startLevel(i));
            } else {
                btn.innerHTML = `${i} <i class="fas fa-lock" style="margin-top:5px; font-size:12px;"></i>`;
            }
            pageDiv.appendChild(btn);
        }
        slider.appendChild(pageDiv);
    }
    
    currentPage = 1;
    document.querySelector('.level-slider').style.transform = 'translateX(0)';
    updatePagination(totalPages);
}

function getStarsHTML(stars) {
    let html = '';
    for (let j = 0; j < 3; j++) {
        html += `<i class="fas fa-star ${j < stars ? 'filled' : ''}"></i>`;
    }
    return html;
}

let currentPage = 1;
document.getElementById("next-page-btn").addEventListener("click", () => {
    let { levelsPerPage } = getLevelLayout();
    let totalPages = Math.ceil(TOTAL_LEVELS / levelsPerPage);
    if(currentPage < totalPages) {
        currentPage++;
        let shift = ((currentPage - 1) * (100 / totalPages));
        document.querySelector('.level-slider').style.transform = `translateX(-${shift}%)`;
        updatePagination(totalPages);
    }
});
document.getElementById("prev-page-btn").addEventListener("click", () => {
    let { levelsPerPage } = getLevelLayout();
    let totalPages = Math.ceil(TOTAL_LEVELS / levelsPerPage);
    if(currentPage > 1) {
        currentPage--;
        let shift = ((currentPage - 1) * (100 / totalPages));
        document.querySelector('.level-slider').style.transform = `translateX(-${shift}%)`;
        updatePagination(totalPages);
    }
});

function updatePagination(totalPages) {
    document.getElementById("page-indicator").innerText = `${currentPage} / ${totalPages}`;
    document.getElementById("prev-page-btn").disabled = currentPage === 1;
    document.getElementById("next-page-btn").disabled = currentPage === totalPages;
}
window.addEventListener("resize", () => {
    if(document.getElementById("level-screen").classList.contains("active")) {
        initLevelScreen();
    }
});

// SELECT CANVAS ELEMENT
const cvs = document.getElementById("breakout");
const ctx = cvs.getContext("2d");
ctx.lineWidth = 3;

// GAME VARIABLES AND CONSTANTS
const PADDLE_WIDTH = 150;
const PADDLE_MARGIN_BOTTOM = 50;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 12;
let LIFE = 3;
let SCORE = 0;
const SCORE_UNIT = 10;
let LEVEL = 1;
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;

// POWERS
let powers = [];
const POWER_TYPES = ["SPEED", "LIFE", "LONG"];
const POWER_COLORS = {"SPEED": "#4caf50", "LIFE": "#f44336", "LONG": "#03a9f4"};
const POWER_ICONS = {"SPEED": "S", "LIFE": "♥", "LONG": "W"};
let activePowerTimeouts = [];

// CREATE THE PADDLE
const paddle = {
    x: cvs.width / 2 - PADDLE_WIDTH / 2,
    y: cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 7
}

function drawPaddle() {
    let grad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    grad.addColorStop(0, "#8d6e63");
    grad.addColorStop(0.5, "#5d4037");
    grad.addColorStop(1, "#3e2723");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 10);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#3e2723";
    ctx.stroke();
    ctx.closePath();
}

document.addEventListener("keydown", function (event) {
    if (event.keyCode == 37) leftArrow = true;
    else if (event.keyCode == 39) rightArrow = true;
});
document.addEventListener("keyup", function (event) {
    if (event.keyCode == 37) leftArrow = false;
    else if (event.keyCode == 39) rightArrow = false;
});

// TOUCH AND MOUSE CONTROLS FOR RESPONSIVENESS
function handlePointerMove(e) {
    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let rect = cvs.getBoundingClientRect();
    // Calculate relative x coordinate across canvas responsive width
    let relX = clientX - rect.left;
    let scaleX = cvs.width / rect.width;
    let scaledX = relX * scaleX;
    
    paddle.x = scaledX - paddle.width / 2;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > cvs.width) paddle.x = cvs.width - paddle.width;
}

cvs.addEventListener("touchmove", handlePointerMove, {passive: true});
cvs.addEventListener("mousemove", handlePointerMove);

function movePaddle() {
    if (rightArrow && paddle.x + paddle.width < cvs.width) paddle.x += paddle.dx;
    else if (leftArrow && paddle.x > 0) paddle.x -= paddle.dx;
}

// CREATE THE BALL
const ball = {
    x: cvs.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: 5,
    dx: 3 * (Math.random() * 2 - 1),
    dy: -4
}

function drawBall() {
    let grad = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 2, ball.x, ball.y, ball.radius);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, "#e0e0e0");
    grad.addColorStop(1, "#757575");

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#424242";
    ctx.stroke();
    ctx.closePath();
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function ballWallCollision() {
    if (ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0) {
        ball.dx = - ball.dx;
        WALL_HIT.play();
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        WALL_HIT.play();
    }
    if (ball.y + ball.radius > cvs.height) {
        LIFE--;
        LIFE_LOST.play();
        resetBall();
    }
}

function resetBall() {
    ball.x = cvs.width / 2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -4;
}

function ballPaddleCollision() {
    if (ball.x < paddle.x + paddle.width && ball.x > paddle.x && paddle.y < paddle.y + paddle.height && ball.y > paddle.y) {
        PADDLE_HIT.play();
        let collidePoint = ball.x - (paddle.x + paddle.width / 2);
        collidePoint = collidePoint / (paddle.width / 2);
        let angle = collidePoint * Math.PI / 3;
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = - ball.speed * Math.cos(angle);
    }
}

// BRICKS
const brick = {
    row: 2,
    column: 5,
    width: 96,
    height: 30,
    offSetLeft: 20,
    offSetTop: 20,
    marginTop: 120,
    strokeColor: "#fff"
}

function createBricks() {
    bricks = [];
    // Increase rows as level progresses
    brick.row = Math.min(Math.floor(LEVEL / 2) + 2, 8);

    for (let r = 0; r < brick.row; r++) {
        bricks[r] = [];
        for (let c = 0; c < brick.column; c++) {
            let bStatus = true;

            // Dynamic hard layouts based on level
            if (LEVEL % 3 === 2) {
                // Checkerboard pattern
                if ((r + c) % 2 === 1) bStatus = false;
            } else if (LEVEL % 3 === 0) {
                // Pyramid gap pattern
                if (r > 0 && (c === 0 || c === brick.column - 1)) bStatus = false;
            }

            // Guarantee at least some bricks are present
            if (r === 0) bStatus = true;

            bricks[r][c] = {
                x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
                y: r * (brick.offSetTop + brick.height) + brick.offSetTop + brick.marginTop,
                status: bStatus
            }
        }
    }
}

function drawBricks() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if (b.status) {
                ctx.drawImage(WOOD_BRICK_IMG, b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

function ballBrickCollision() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if (b.status) {
                if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height) {
                    BRICK_HIT.play();
                    ball.dy = - ball.dy;
                    b.status = false;
                    SCORE += SCORE_UNIT;

                    // DROP POWER UP
                    if (Math.random() < 0.20) {
                        powers.push({
                            x: b.x + brick.width / 2,
                            y: b.y + brick.height,
                            type: POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)],
                            dy: 3,
                            radius: 12
                        });
                    }
                }
            }
        }
    }
}
function drawPowers() {
    powers.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = POWER_COLORS[p.type];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = "#fff";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(POWER_ICONS[p.type], p.x, p.y + 1);
        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic";
    });
}
function applyPower(type) {
    if (type === "LIFE") {
        LIFE++;
    } else if (type === "SPEED") {
        paddle.dx = 12; 
        ball.speed *= 1.5;
        ball.dx *= 1.5;
        ball.dy *= 1.5;
        activePowerTimeouts.push(setTimeout(() => {
            paddle.dx = 7;
            ball.speed /= 1.5;
            ball.dx /= 1.5;
            ball.dy /= 1.5;
        }, 10000));
    } else if (type === "LONG") {
        paddle.width = PADDLE_WIDTH * 1.5;
        if(paddle.x + paddle.width > cvs.width) paddle.x = cvs.width - paddle.width;
        activePowerTimeouts.push(setTimeout(() => paddle.width = PADDLE_WIDTH, 10000));
    }
}
function movePowers() {
    for (let i = powers.length - 1; i >= 0; i--) {
        let p = powers[i];
        p.y += p.dy;
        
        // Paddle collision
        let py = p.y + p.radius;
        if (p.x > paddle.x && p.x < paddle.x + paddle.width && py > paddle.y && p.y - p.radius < paddle.y + paddle.height) {
            applyPower(p.type);
            powers.splice(i, 1);
        } else if (p.y > cvs.height) {
            powers.splice(i, 1);
        }
    }
}

function draw() {
    drawPaddle();
    drawBall();
    drawBricks();
    drawPowers();
}

function updateDOMStats() {
    document.getElementById("score-val").innerText = SCORE;
    document.getElementById("life-val").innerText = LIFE;
    document.getElementById("level-val").innerText = LEVEL;
}

function levelUp() {
    let isLevelDone = true;
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            isLevelDone = isLevelDone && !bricks[r][c].status;
        }
    }

    if (isLevelDone) {
        WIN.play();
        GAME_OVER = true;
        let starsEarned = LIFE === 3 ? 3 : (LIFE === 2 ? 2 : 1);

        if (!levelData[LEVEL]) levelData[LEVEL] = { unlocked: true, stars: 0 };
        levelData[LEVEL].stars = Math.max(levelData[LEVEL].stars, starsEarned);

        if (LEVEL < TOTAL_LEVELS) {
            if (!levelData[LEVEL + 1]) {
                levelData[LEVEL + 1] = { unlocked: true, stars: 0 };
            }
        }
        localStorage.setItem('breakoutLevels', JSON.stringify(levelData));
        showPopup(true, starsEarned);
    }
}

function gameOver() {
    if (LIFE <= 0) {
        GAME_OVER = true;
        showPopup(false, 0);
    }
}

function showPopup(won, stars) {
    document.getElementById("gameover").style.display = "flex";
    document.getElementById("popup-title").innerText = won ? "Level Complete!" : "Game Over";
    document.getElementById("popup-level-txt").innerText = "Level: " + LEVEL;
    document.getElementById("popup-score-txt").innerText = "Score: " + SCORE;
    document.getElementById("next-level-btn").style.display = (won && LEVEL < TOTAL_LEVELS) ? "block" : "none";

    for (let i = 1; i <= 3; i++) {
        let starEl = document.getElementById(`star-${i}`);
        starEl.className = "fas fa-star";
        if (i <= stars) {
            setTimeout(() => {
                starEl.classList.add("filled", "animating");
                setTimeout(() => starEl.classList.remove("animating"), 300);
            }, i * 300);
        }
    }
}

function update() {
    movePaddle();
    moveBall();
    ballWallCollision();
    ballPaddleCollision();
    ballBrickCollision();
    movePowers();
    updateDOMStats();
    gameOver();
    levelUp();
}

let animationId;
function loop() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    draw();
    update();
    if (!GAME_OVER) {
        animationId = requestAnimationFrame(loop);
    }
}

// UI INTERACTIONS
function startLevel(lvl) {
    LEVEL = lvl;
    LIFE = 3;
    SCORE = 0;
    GAME_OVER = false;

    // reset powers
    powers = [];
    activePowerTimeouts.forEach(t => clearTimeout(t));
    activePowerTimeouts = [];
    paddle.width = PADDLE_WIDTH;
    paddle.dx = 7;

    brick.row = Math.min(Math.floor(lvl / 2) + 2, 8);
    let baseSpeed = 4 + (lvl / 10);
    ball.speed = baseSpeed;

    resetBall();
    createBricks();
    showScreen(gameScreen);

    if (animationId) cancelAnimationFrame(animationId);
    loop();
}

document.getElementById("restart-btn").addEventListener("click", () => {
    document.getElementById("gameover").style.display = "none";
    startLevel(LEVEL);
});

document.getElementById("next-level-btn").addEventListener("click", () => {
    document.getElementById("gameover").style.display = "none";
    startLevel(LEVEL + 1);
});

document.getElementById("popup-home-btn").addEventListener("click", () => {
    document.getElementById("gameover").style.display = "none";
    initLevelScreen();
    showScreen(levelScreen);
});

document.getElementById("home-btn").addEventListener("click", () => {
    GAME_OVER = true;
    initLevelScreen();
    showScreen(levelScreen);
});

// SOUND LOGIC
const soundElement = document.getElementById("sound");
soundElement.addEventListener("click", audioManager);

function audioManager() {
    let imgSrc = soundElement.getAttribute("src");
    let SOUND_IMG = imgSrc == "img/SOUND_ON.png" ? "img/SOUND_OFF.png" : "img/SOUND_ON.png";
    soundElement.setAttribute("src", SOUND_IMG);

    WALL_HIT.muted = !WALL_HIT.muted;
    PADDLE_HIT.muted = !PADDLE_HIT.muted;
    BRICK_HIT.muted = !BRICK_HIT.muted;
    WIN.muted = !WIN.muted;
    LIFE_LOST.muted = !LIFE_LOST.muted;
}



















