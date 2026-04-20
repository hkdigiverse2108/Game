    // ======================== BUBBLE SHOOTER ENGINE (enhanced) ========================
    const BUBBLE_COLORS = ["#3b9eff", "#f4a261", "#2dc9a8", "#a87bff", "#ffb347", "#57c0e8"];
    const BALL_RADIUS = 14;
    const CANVAS_W = 500, CANVAS_H = 600;
    let canvas, ctx;
    let isGameActive = true, isPaused = false, animFrame;
    let currentLevel = 1, totalScore = 0, ballsRemaining = 38;
    let bubblesList = [];
    let shootingBall = null;
    let aimPosition = { x: CANVAS_W/2, y: CANVAS_H-80 };
    let currentBallColor = BUBBLE_COLORS[0];
    let nextBallColor = BUBBLE_COLORS[1];
    let particlesArray = [];
    let soundEnabled = true;
    let levelProgress = {};

    const TOTAL_LEVELS = 20;
    for (let i = 1; i <= TOTAL_LEVELS; i++) levelProgress[i] = { completed: false, stars: 0 };

    // DOM
    const loadingScreen = document.getElementById('loadingScreen');
    const mainMenuScreen = document.getElementById('mainMenu');
    const levelSelectScreen = document.getElementById('levelSelectScreen');
    const gameScreenDiv = document.getElementById('gameScreen');
    const pauseMenu = document.getElementById('pausePopup');
    const levelCompleteMenu = document.getElementById('levelCompletePopup');
    const gameOverMenu = document.getElementById('gameOverPopup');

    // Simple Audio FX
    function playFx(type) {
        if (!soundEnabled) return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            if (type === 'shoot') { osc.frequency.value = 980; gain.gain.setValueAtTime(0.2, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime+0.1); osc.start(); osc.stop(audioCtx.currentTime+0.1); }
            if (type === 'pop') { osc.frequency.value = 720; gain.gain.setValueAtTime(0.2, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime+0.09); osc.start(); osc.stop(audioCtx.currentTime+0.1); }
            if (type === 'win') { osc.frequency.value = 880; gain.gain.setValueAtTime(0.25, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime+0.45); osc.start(); osc.stop(audioCtx.currentTime+0.5); }
        } catch(e) {}
    }

    function generateLevelStructure(level) {
        let rows = Math.min(4 + Math.floor(level / 3), 8);
        let newBubbles = [];
        for (let row = 0; row < rows; row++) {
            let cols = 9 - Math.floor(row * 0.7);
            let startX = (CANVAS_W - (cols * (BALL_RADIUS*2))) / 2;
            for (let c = 0; c < cols; c++) {
                let x = startX + c * (BALL_RADIUS*2);
                let y = 45 + row * (BALL_RADIUS*1.78);
                let colorPick = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
                newBubbles.push({ x, y, color: colorPick, radius: BALL_RADIUS, falling: false, vy: 0 });
            }
        }
        return newBubbles;
    }

    function initGame(level) {
        bubblesList = generateLevelStructure(level);
        totalScore = 0;
        ballsRemaining = 38 + Math.max(0, 14 - Math.floor(level/2));
        currentBallColor = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
        nextBallColor = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
        shootingBall = null;
        particlesArray = [];
        updateGameUI();
        isGameActive = true;
        isPaused = false;
        pauseMenu.classList.remove('active');
        if (animFrame) cancelAnimationFrame(animFrame);
        gameLoop();
    }

    function updateGameUI() {
        document.getElementById('currentLevelNum').innerText = currentLevel;
        document.getElementById('currentScore').innerText = totalScore;
        document.getElementById('currentBalls').innerText = ballsRemaining;
        const nextPreview = document.getElementById('nextBallPreview');
        if (nextPreview) nextPreview.style.backgroundColor = nextBallColor;
    }

    function shootBubble(targetX, targetY) {
        if (shootingBall !== null || ballsRemaining <= 0 || isPaused || !isGameActive) return false;
        const startX = CANVAS_W/2, startY = CANVAS_H-70;
        let dx = targetX - startX;
        let dy = targetY - startY;
        const len = Math.hypot(dx, dy);
        if (len < 5) return false;
        dx /= len; dy /= len;
        shootingBall = {
            x: startX, y: startY, vx: dx * 9.5, vy: dy * 9.5,
            color: currentBallColor, rad: BALL_RADIUS
        };
        ballsRemaining--;
        currentBallColor = nextBallColor;
        nextBallColor = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
        updateGameUI();
        playFx('shoot');
        return true;
    }

    function updateShooting() {
        if (!shootingBall) return;
        shootingBall.x += shootingBall.vx;
        shootingBall.y += shootingBall.vy;
        if (shootingBall.x - BALL_RADIUS <= 0) { shootingBall.x = BALL_RADIUS; shootingBall.vx = -shootingBall.vx; }
        if (shootingBall.x + BALL_RADIUS >= CANVAS_W) { shootingBall.x = CANVAS_W - BALL_RADIUS; shootingBall.vx = -shootingBall.vx; }
        if (shootingBall.y - BALL_RADIUS <= 0) { attachShootBall(); return; }
        for (let b of bubblesList) {
            if (Math.hypot(shootingBall.x - b.x, shootingBall.y - b.y) < BALL_RADIUS * 2) {
                attachShootBall();
                return;
            }
        }
        if (shootingBall.y + BALL_RADIUS >= CANVAS_H) attachShootBall();
    }

    function attachShootBall() {
        if (!shootingBall) return;
        let nx = Math.min(Math.max(shootingBall.x, BALL_RADIUS), CANVAS_W - BALL_RADIUS);
        let ny = Math.min(shootingBall.y, CANVAS_H - BALL_RADIUS);
        bubblesList.push({ x: nx, y: ny, color: shootingBall.color, radius: BALL_RADIUS, falling: false, vy: 0 });
        shootingBall = null;
        processMatchesAndFalling();
        checkWinLose();
    }

    function getNeighbors(idx) {
        let neigh = [];
        for (let i = 0; i < bubblesList.length; i++) {
            if (i === idx) continue;
            if (Math.hypot(bubblesList[idx].x - bubblesList[i].x, bubblesList[idx].y - bubblesList[i].y) < BALL_RADIUS * 2.1)
                neigh.push(i);
        }
        return neigh;
    }

    function findGroup(start) {
        const colorTarget = bubblesList[start].color;
        const stack = [start];
        const visited = new Set();
        const group = [];
        while (stack.length) {
            let id = stack.pop();
            if (visited.has(id)) continue;
            visited.add(id);
            if (bubblesList[id].color !== colorTarget) continue;
            group.push(id);
            for (let n of getNeighbors(id)) if (!visited.has(n)) stack.push(n);
        }
        return group;
    }

    function processMatchesAndFalling() {
        let anyMatch = true;
        while (anyMatch) {
            anyMatch = false;
            let toDelete = new Set();
            for (let i = 0; i < bubblesList.length; i++) {
                let group = findGroup(i);
                if (group.length >= 3) {
                    group.forEach(id => toDelete.add(id));
                }
            }
            if (toDelete.size > 0) {
                anyMatch = true;
                totalScore += toDelete.size * 10;
                for (let id of toDelete) {
                    let b = bubblesList[id];
                    addParticleEffect(b.x, b.y, b.color);
                }
                bubblesList = bubblesList.filter((_, idx) => !toDelete.has(idx));
                playFx('pop');
                updateGameUI();
                applyGravityToBubbles();
            } else break;
        }
        applyGravityToBubbles();
    }

    function applyGravityToBubbles() {
        let attached = new Set();
        for (let i = 0; i < bubblesList.length; i++) {
            if (bubblesList[i].y < 85) attached.add(i);
        }
        let changed = true;
        while (changed) {
            changed = false;
            for (let i = 0; i < bubblesList.length; i++) {
                if (attached.has(i)) {
                    for (let n of getNeighbors(i)) {
                        if (!attached.has(n)) { attached.add(n); changed = true; }
                    }
                }
            }
        }
        for (let i = 0; i < bubblesList.length; i++) {
            bubblesList[i].falling = !attached.has(i);
            if (bubblesList[i].falling) bubblesList[i].vy = 1;
        }
    }

    function updateFallingBubbles() {
        let anyFalling = false;
        for (let b of bubblesList) {
            if (b.falling) {
                anyFalling = true;
                b.vy += 0.35;
                b.y += b.vy;
            }
        }
        bubblesList = bubblesList.filter(b => b.y + BALL_RADIUS < CANVAS_H + 60);
        if (anyFalling) updateGameUI();
    }

    function addParticleEffect(x, y, color) {
        for (let i = 0; i < 10; i++) {
            particlesArray.push({
                x, y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5 - 1,
                life: 1, col: color
            });
        }
    }

    function updateParticles() {
        for (let i = particlesArray.length-1; i >=0; i--) {
            let p = particlesArray[i];
            p.x += p.vx; p.y += p.vy;
            p.life -= 0.035;
            if (p.life <= 0) particlesArray.splice(i,1);
        }
    }

    function checkWinLose() {
        if (bubblesList.length === 0) {
            isGameActive = false;
            let stars = ballsRemaining > 20 ? 3 : (ballsRemaining > 10 ? 2 : 1);
            levelProgress[currentLevel] = { completed: true, stars: stars };
            document.getElementById('finalScoreVal').innerText = totalScore;
            let starDisplay = '';
            for (let s=0; s<stars; s++) starDisplay += '<i class="fas fa-star"></i>';
            for (let s=stars; s<3; s++) starDisplay += '<i class="far fa-star"></i>';
            document.getElementById('starsResult').innerHTML = starDisplay;
            levelCompleteMenu.classList.add('active');
            playFx('win');
            if (animFrame) cancelAnimationFrame(animFrame);
            return;
        }
        if (ballsRemaining <= 0 && bubblesList.length > 0) {
            isGameActive = false;
            document.getElementById('gameOverScoreVal').innerText = totalScore;
            gameOverMenu.classList.add('active');
            if (animFrame) cancelAnimationFrame(animFrame);
        }
    }

    function drawCanvas() {
        if (!ctx) return;
        ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
        ctx.shadowBlur = 4; ctx.shadowColor = "rgba(0,0,0,0.3)";
        for (let b of bubblesList) {
            ctx.beginPath(); ctx.arc(b.x, b.y, BALL_RADIUS-1, 0, Math.PI*2);
            ctx.fillStyle = b.color; ctx.fill();
            ctx.strokeStyle = "#cceeff"; ctx.lineWidth = 2; ctx.stroke();
            ctx.beginPath(); ctx.arc(b.x-4, b.y-4, 4, 0, Math.PI*2); ctx.fillStyle = "rgba(255,250,210,0.75)"; ctx.fill();
        }
        if (shootingBall) {
            ctx.beginPath(); ctx.arc(shootingBall.x, shootingBall.y, BALL_RADIUS-1, 0, Math.PI*2);
            ctx.fillStyle = shootingBall.color; ctx.fill(); ctx.stroke();
        }
        const cannonX = CANVAS_W/2, cannonY = CANVAS_H-70;
        ctx.fillStyle = "#285f7a"; ctx.fillRect(cannonX-25, cannonY-15, 50, 35);
        ctx.fillStyle = "#48b5ff"; ctx.beginPath(); ctx.ellipse(cannonX, cannonY-6, 20, 14, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cannonX, cannonY-16, BALL_RADIUS-2, 0, Math.PI*2);
        ctx.fillStyle = currentBallColor; ctx.fill(); ctx.stroke();
        let aimDX = aimPosition.x - cannonX, aimDY = aimPosition.y - cannonY;
        let aimLen = Math.hypot(aimDX, aimDY);
        if (aimLen > 18 && !shootingBall && isGameActive) {
            let normX = aimDX/aimLen, normY = aimDY/aimLen;
            ctx.beginPath(); ctx.moveTo(cannonX, cannonY-12);
            ctx.lineTo(cannonX + normX*230, cannonY + normY*230-12);
            ctx.strokeStyle = "#ffdf80"; ctx.lineWidth = 3; ctx.setLineDash([6, 12]); ctx.stroke(); ctx.setLineDash([]);
        }
        for (let p of particlesArray) {
            ctx.globalAlpha = p.life; ctx.fillStyle = p.col; ctx.fillRect(p.x-3, p.y-3, 6, 6);
        }
        ctx.globalAlpha = 1;
    }

    function updateFrame() { if (!isPaused && isGameActive) { updateShooting(); updateFallingBubbles(); updateParticles(); } }
    function gameLoop() { updateFrame(); drawCanvas(); animFrame = requestAnimationFrame(gameLoop); }

    function showScreen(screenId) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(screenId).classList.add('active'); }
    function loadLevelSelectUI() {
        const container = document.getElementById('levelGrid'); container.innerHTML = '';
        for (let i=1; i<=TOTAL_LEVELS; i++) {
            const card = document.createElement('div'); card.classList.add('level-card');
            const unlocked = (i===1) || (levelProgress[i-1]?.completed === true);
            if (!unlocked) { card.classList.add('locked'); card.innerHTML = `<div><i class="fas fa-lock"></i> ${i}</div>`; }
            else {
                const prog = levelProgress[i];
                if (prog.completed) card.classList.add('completed');
                let starsHtml = prog.completed ? `<div class="star-rating">${'<i class="fas fa-star"></i>'.repeat(prog.stars)}${'<i class="far fa-star"></i>'.repeat(3-prog.stars)}</div>` : `<div class="star-rating"><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i></div>`;
                card.innerHTML = `<div>${i}</div>${starsHtml}`;
                card.addEventListener('click', () => startLevel(i));
            }
            container.appendChild(card);
        }
    }
    function startLevel(level) { currentLevel = level; initGame(currentLevel); showScreen('gameScreen'); isGameActive = true; isPaused = false; }
    function restartLevel() { initGame(currentLevel); isGameActive = true; isPaused = false; pauseMenu.classList.remove('active'); if(animFrame) cancelAnimationFrame(animFrame); gameLoop(); }

    function setupEvents() {
        canvas = document.getElementById('gameCanvas'); ctx = canvas.getContext('2d'); canvas.width = CANVAS_W; canvas.height = CANVAS_H;
        const getCoords = (clientX, clientY) => { const rect = canvas.getBoundingClientRect(); const sx = canvas.width/rect.width, sy = canvas.height/rect.height; return { x: (clientX - rect.left)*sx, y: (clientY - rect.top)*sy }; };
        canvas.addEventListener('mousemove', (e) => { const {x,y}=getCoords(e.clientX,e.clientY); aimPosition.x=Math.min(Math.max(x,20),CANVAS_W-20); aimPosition.y=Math.min(Math.max(y,20),CANVAS_H-40); });
        canvas.addEventListener('click', (e) => { if(!isPaused && isGameActive){ const {x,y}=getCoords(e.clientX,e.clientY); shootBubble(x,y); } });
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); if(!isPaused && isGameActive){ const t=e.touches[0]; const {x,y}=getCoords(t.clientX,t.clientY); shootBubble(x,y); } });
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); const t=e.touches[0]; const {x,y}=getCoords(t.clientX,t.clientY); aimPosition.x=Math.min(Math.max(x,20),CANVAS_W-20); aimPosition.y=Math.min(Math.max(y,20),CANVAS_H-40); });
        document.getElementById('pauseGameBtn').onclick = () => { isPaused=true; pauseMenu.classList.add('active'); };
        document.getElementById('resumeGameBtn').onclick = () => { isPaused=false; pauseMenu.classList.remove('active'); };
        document.getElementById('restartPauseBtn').onclick = () => { pauseMenu.classList.remove('active'); restartLevel(); };
        document.getElementById('menuPauseBtn').onclick = () => { pauseMenu.classList.remove('active'); showScreen('mainMenu'); if(animFrame) cancelAnimationFrame(animFrame); };
        document.getElementById('restartLevelBtn').onclick = () => restartLevel();
        document.getElementById('exitGameMenuBtn').onclick = () => { showScreen('mainMenu'); if(animFrame) cancelAnimationFrame(animFrame); };
        document.getElementById('nextLevelActionBtn').onclick = () => { levelCompleteMenu.classList.remove('active'); if(currentLevel<TOTAL_LEVELS) startLevel(currentLevel+1); else alert("🏆 You conquered all levels! 🏆"); };
        document.getElementById('replayLevelActionBtn').onclick = () => { levelCompleteMenu.classList.remove('active'); restartLevel(); };
        document.getElementById('levelSelectCompleteBtn').onclick = () => { levelCompleteMenu.classList.remove('active'); loadLevelSelectUI(); showScreen('levelSelectScreen'); };
        document.getElementById('retryGameBtn').onclick = () => { gameOverMenu.classList.remove('active'); restartLevel(); };
        document.getElementById('gameOverMenuBtn').onclick = () => { gameOverMenu.classList.remove('active'); showScreen('mainMenu'); };
        document.getElementById('playNowBtn').onclick = () => startLevel(1);
        document.getElementById('levelSelectMenuBtn').onclick = () => { loadLevelSelectUI(); showScreen('levelSelectScreen'); };
        document.getElementById('backToMenuBtn').onclick = () => showScreen('mainMenu');
        const soundBtn = document.getElementById('soundMenuBtn');
        soundBtn.onclick = () => { soundEnabled = !soundEnabled; soundBtn.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i> SOUND ON' : '<i class="fas fa-volume-mute"></i> SOUND OFF'; };
    }

    let loadPercent = 0;
    const loadInterval = setInterval(() => { loadPercent += Math.random()*18; if(loadPercent>=100){ clearInterval(loadInterval); document.getElementById('loadFill').style.width='100%'; document.getElementById('loadPercentText').innerHTML='<i class="fas fa-check-circle"></i> Ready!'; setTimeout(()=>{ loadingScreen.classList.remove('active'); mainMenuScreen.classList.add('active'); },500); } else { document.getElementById('loadFill').style.width=loadPercent+'%'; document.getElementById('loadPercentText').innerText=`Loading ${Math.floor(loadPercent)}%`; } }, 150);
    setupEvents();