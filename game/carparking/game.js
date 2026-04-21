class ParkingJam {
    constructor() {
        this.boardSize = 6;
        this.cellSize = 0;
        this.board = document.getElementById('game-board');
        this.levelNumDisplay = document.getElementById('level-num');
        this.timerDisplay = document.getElementById('timer-display');
        this.overlay = document.getElementById('ui-overlay');
        this.nextLevelBtn = document.getElementById('next-level-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.replayBtn = document.getElementById('replay-btn');

        // Navigation & Screens
        this.loadingScreen = document.getElementById('loading-screen');
        this.levelSelectScreen = document.getElementById('level-select-screen');
        this.gameContainer = document.getElementById('game-container');
        this.homeBtn = document.getElementById('home-btn');
        this.levelsGrid = document.getElementById('levels-grid');
        this.particlesContainer = document.getElementById('particles-container');

        // Persistent Data setup
        this.unlockedLevels = parseInt(sessionStorage.getItem('parkingJamUnlocked')) || 1;
        this.levelStars = JSON.parse(sessionStorage.getItem('parkingJamStars')) || {};

        this.currentLevel = 0;
        this.cars = [];
        this.activeCarsCount = 0;
        this.isDragging = false;
        this.activeCar = null;
        this.dragOffset = 0;
        this.initialPos = 0;

        // Pagination
        this.currentPage = 0;
        this.totalPages = 2; // 60 levels, 30 per page
        this.prevPageBtn = document.getElementById('prev-page-btn');
        this.nextPageBtn = document.getElementById('next-page-btn');
        this.pageIndicator = document.getElementById('page-indicator');

        // Timer vars
        this.timerInterval = null;
        this.timeLeft = 0;
        this.originalTimeLimit = 0;
        this.isGameOver = false;

        this.generateLevels();
        this.init();
    }

    getExpectedBoardSize(levelIndex) {
        if (levelIndex < 20) return 15;    // Levels 1-20
        if (levelIndex < 40) return 20;    // Levels 21-40
        return 25;                         // Levels 41-60
    }

    generateLevels() {
        this.levels = [];
        const colors = ['var(--car-red)', 'var(--car-blue)', 'var(--car-green)', 'var(--car-yellow)', 'var(--car-purple)', 'var(--car-orange)'];

        for (let i = 0; i < 60; i++) {
            const bSize = this.getExpectedBoardSize(i);
            
            let targetCars = 15 + Math.floor(Math.random() * 5);
            if (bSize === 20) targetCars = 25 + Math.floor(Math.random() * 8);
            if (bSize === 25) targetCars = 35 + Math.floor(Math.random() * 10);
            
            const cars = [];
            const grid = Array.from({ length: bSize }, () => Array(bSize).fill(false));
            
            let attempts = 0;
            while (cars.length < targetCars && attempts < 2000) {
                attempts++;
                const len = Math.floor(Math.random() * 3) + 2; // 2 to 4
                const dir = Math.random() < 0.5 ? 'h' : 'v';
                const facing = dir === 'h' ? (Math.random() < 0.5 ? 'left' : 'right') : (Math.random() < 0.5 ? 'up' : 'down');
                
                const maxCoord = bSize - (dir === 'h' ? len : 1);
                const x = Math.floor(Math.random() * (maxCoord + 1));
                const maxCoordY = bSize - (dir === 'v' ? len : 1);
                const y = Math.floor(Math.random() * (maxCoordY + 1));
                
                let overlap = false;
                for (let j = 0; j < len; j++) {
                    const cx = dir === 'h' ? x + j : x;
                    const cy = dir === 'v' ? y + j : y;
                    if (grid[cy] === undefined || grid[cy][cx] === undefined || grid[cy][cx]) {
                        overlap = true;
                        break;
                    }
                }
                
                if (!overlap) {
                    for (let j = 0; j < len; j++) {
                        const cx = dir === 'h' ? x + j : x;
                        const cy = dir === 'v' ? y + j : y;
                        grid[cy][cx] = true;
                    }
                    cars.push({
                        id: `c${cars.length + 1}`,
                        x, y, len, dir, facing,
                        color: colors[Math.floor(Math.random() * colors.length)]
                    });
                }
            }

            const obstacles = [];
            let numObstacles = Math.floor(bSize * 0.4); // slightly less dense to keep paths open
            let obsAttempts = 0;
            while (obstacles.length < numObstacles && obsAttempts < 500) {
                obsAttempts++;
                const ox = Math.floor(Math.random() * bSize);
                const oy = Math.floor(Math.random() * bSize);
                
                if (!grid[oy][ox]) {
                    // Check if placing this obstacle would trap a car on both sides
                    let willTrap = false;
                    for (const car of cars) {
                        if (car.dir === 'h' && car.y === oy) {
                            const isLeft = ox < car.x;
                            const isRight = ox > car.x;
                            if (isLeft || isRight) {
                                const hasLeftObs = obstacles.some(o => o.y === oy && o.x < car.x) || isLeft;
                                const hasRightObs = obstacles.some(o => o.y === oy && o.x > car.x) || isRight;
                                if (hasLeftObs && hasRightObs) { willTrap = true; break; }
                            }
                        }
                        if (car.dir === 'v' && car.x === ox) {
                            const isTop = oy < car.y;
                            const isBottom = oy > car.y;
                            if (isTop || isBottom) {
                                const hasTopObs = obstacles.some(o => o.x === ox && o.y < car.y) || isTop;
                                const hasBottomObs = obstacles.some(o => o.x === ox && o.y > car.y) || isBottom;
                                if (hasTopObs && hasBottomObs) { willTrap = true; break; }
                            }
                        }
                    }
                    
                    if (!willTrap) {
                        grid[oy][ox] = true;
                        const type = Math.random() > 0.5 ? 'stone' : 'box';
                        obstacles.push({ x: ox, y: oy, type: type });
                    }
                }
            }

            const timeLimit = Math.max(15, Math.floor((bSize * 4) - (i * 0.5)));

            this.levels.push({
                timeLimit: timeLimit,
                cars: cars,
                obstacles: obstacles
            });
        }
    }

    init() {
        this.simulateLoading();

        this.homeBtn.addEventListener('click', () => {
            if (this.timerInterval) clearInterval(this.timerInterval);
            this.showScreen('level-select-screen');
        });

        this.prevPageBtn.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.updatePagination();
            }
        });

        this.nextPageBtn.addEventListener('click', () => {
            if (this.currentPage < 1) { // 2 pages: 0 and 1
                this.currentPage++;
                this.updatePagination();
            }
        });

        this.nextLevelBtn.addEventListener('click', () => {
            this.overlay.classList.add('hidden');
            if (this.currentLevel === this.levels.length - 1) {
                this.showScreen('level-select-screen');
            } else {
                this.startGame(this.currentLevel + 1);
            }
        });

        this.replayBtn.addEventListener('click', () => {
            this.overlay.classList.add('hidden');
            this.loadLevel(this.currentLevel);
        });

        this.resetBtn.addEventListener('click', () => {
            this.loadLevel(this.currentLevel);
        });

        window.addEventListener('resize', () => this.updateCellSize());
    }

    simulateLoading() {
        const progressEl = document.getElementById('loader-progress');
        const textEl = document.getElementById('loader-text');
        const carEl = document.querySelector('.loader-car');
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 5) + 1;
            if (progress >= 100) progress = 100;

            progressEl.style.width = `${progress}%`;
            carEl.style.left = `${progress}%`;
            textEl.textContent = `${progress}%`;

            if (progress === 100) {
                clearInterval(interval);
                setTimeout(() => {
                    this.showScreen('level-select-screen');
                }, 500);
            }
        }, 30);
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) targetScreen.classList.add('active');

        if (screenId === 'level-select-screen') {
            this.renderLevelSelect();
        }
    }

    renderLevelSelect() {
        this.levelsGrid.innerHTML = '';

        // Sync pagination bar state on every render
        if (this.pageIndicator) {
            this.pageIndicator.textContent = `Page ${this.currentPage + 1} / ${this.totalPages}`;
        }
        if (this.prevPageBtn) this.prevPageBtn.disabled = this.currentPage === 0;
        if (this.nextPageBtn) this.nextPageBtn.disabled = this.currentPage >= this.totalPages - 1;

        const start = this.currentPage * 30;
        const end = Math.min(start + 30, this.levels.length);

        for (let i = start; i < end; i++) {
            const btn = document.createElement('div');
            btn.className = 'level-btn';

            if (i < this.unlockedLevels - 1) {
                btn.classList.add('completed');
                const earnedStars = this.levelStars[i] || 0;
                btn.innerHTML = `
                    <div class="level-stars">
                        <span class="mini-star ${earnedStars >= 1 ? 'earned' : ''}">★</span>
                        <span class="mini-star ${earnedStars >= 2 ? 'earned' : ''}">★</span>
                        <span class="mini-star ${earnedStars === 3 ? 'earned' : ''}">★</span>
                    </div>
                `;
                btn.addEventListener('click', () => this.startGame(i));
            } else if (i === this.unlockedLevels - 1) {
                btn.innerHTML = `<span>${i + 1}</span>`;
                btn.addEventListener('click', () => this.startGame(i));
            } else {
                btn.classList.add('locked');
            }

            this.levelsGrid.appendChild(btn);
        }
    }

    updatePagination() {
        this.levelsGrid.style.opacity = '0';
        this.levelsGrid.style.transform = this.currentPage === 0 ? 'translateX(-30px)' : 'translateX(30px)';
        
        setTimeout(() => {
            this.renderLevelSelect();

            // Update page indicator
            if (this.pageIndicator) {
                this.pageIndicator.textContent = `Page ${this.currentPage + 1} / ${this.totalPages}`;
            }

            // Disable/enable arrow buttons
            this.prevPageBtn.disabled = this.currentPage === 0;
            this.nextPageBtn.disabled = this.currentPage >= this.totalPages - 1;
            
            this.levelsGrid.offsetHeight; // trigger reflow
            
            this.levelsGrid.style.opacity = '1';
            this.levelsGrid.style.transform = 'translateX(0)';
        }, 150);
    }

    startGame(levelIndex) {
        this.currentLevel = levelIndex;
        this.loadLevel(this.currentLevel);
        this.showScreen('game-container');
    }

    updateCellSize() {
        if (!this.board) return;
        const boardWidth = this.board.clientWidth - 24; // subtract 12px padding on each side
        this.cellSize = boardWidth / this.boardSize;
        this.board.style.setProperty('--cell-size', `${this.cellSize}px`);

        if (this.currentLevel !== null && this.cars.length > 0) {
            this.renderCars();
        }
    }

    loadLevel(index) {
        this.isGameOver = false;
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.levelNumDisplay.textContent = index + 1;
        this.boardSize = this.getExpectedBoardSize(index);

        const levelData = this.levels[index];
        this.cars = JSON.parse(JSON.stringify(levelData.cars));
        this.obstacles = JSON.parse(JSON.stringify(levelData.obstacles || []));
        this.activeCarsCount = this.cars.length;

        this.originalTimeLimit = levelData.timeLimit;
        this.timeLeft = this.originalTimeLimit;

        this.lives = 3;
        this.updateLivesDisplay();
        this.updateTimerDisplay();

        setTimeout(() => this.updateCellSize(), 50); // let UI settle, then measure and paint


        // Start Timer
        this.timerInterval = setInterval(() => {
            if (this.isGameOver) return;
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.triggerGameOver();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        this.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (this.timeLeft <= 5) {
            this.timerDisplay.style.color = '#ef4444'; // turn red
        } else {
            this.timerDisplay.style.color = 'var(--accent-color)';
        }
    }

    updateLivesDisplay() {
        const dots = document.querySelectorAll('.life-dot');
        dots.forEach((dot, index) => {
            if (index < this.lives) {
                dot.classList.remove('lost');
            } else {
                dot.classList.add('lost');
            }
        });
    }

    triggerGameOver(reason = "time") {
        this.isGameOver = true;
        clearInterval(this.timerInterval);

        if (reason === "lives") {
            document.getElementById('overlay-title').textContent = "CRASHED OUT!";
            document.getElementById('overlay-desc').textContent = "You lost your 3 lives by crashing.";
        } else {
            document.getElementById('overlay-title').textContent = "TIME'S UP!";
            document.getElementById('overlay-desc').textContent = "You failed to clear the lot in time.";
        }

        // Hide stars on game over
        document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
        document.getElementById('star-rating').style.display = 'none';

        this.nextLevelBtn.style.display = 'none'; // hide next level
        this.overlay.classList.remove('hidden');
    }

    renderCars() {
        this.board.innerHTML = '';

        this.obstacles.forEach(obs => {
            const el = document.createElement('div');
            el.className = `obstacle ${obs.type}`;
            el.style.left = `${obs.x * this.cellSize + 12 + 4}px`;
            el.style.top = `${obs.y * this.cellSize + 12 + 4}px`;
            this.board.appendChild(el);
        });

        this.cars.forEach(car => {
            if (car.isExiting) return;

            const carEl = document.createElement('div');
            carEl.className = `car ${car.dir === 'h' ? 'horizontal' : 'vertical'}`;
            carEl.id = car.id;
            carEl.style.background = car.color;

            ['tl', 'tr', 'bl', 'br'].forEach(pos => {
                const wheel = document.createElement('div');
                wheel.className = `wheel w-${pos}`;
                carEl.appendChild(wheel);
            });

            ['left', 'right'].forEach(pos => {
                const mirror = document.createElement('div');
                mirror.className = `mirror m-${pos}`;
                carEl.appendChild(mirror);
            });

            const body = document.createElement('div');
            body.className = 'car-body';
            body.style.background = car.color;
            carEl.appendChild(body);

            const cabin = document.createElement('div');
            cabin.className = 'car-cabin';
            carEl.appendChild(cabin);

            const fLights = document.createElement('div');
            fLights.className = 'lights-front';
            carEl.appendChild(fLights);

            const bLights = document.createElement('div');
            bLights.className = 'lights-back';
            carEl.appendChild(bLights);

            // Apply visual direction flips
            if (car.dir === 'h' && car.facing === 'left') carEl.style.transform = 'scaleX(-1)';
            if (car.dir === 'v' && car.facing === 'down') carEl.style.transform = 'scaleY(-1)';

            this.updateCarElementPosition(carEl, car);

            carEl.addEventListener('click', () => this.handleCarClick(car, carEl));

            this.board.appendChild(carEl);
        });
    }

    updateCarElementPosition(el, car) {
        const width = car.dir === 'h' ? car.len : 1;
        const height = car.dir === 'v' ? car.len : 1;
        
        el.style.width = `${width * this.cellSize - 4}px`;
        el.style.height = `${height * this.cellSize - 4}px`;

        el.style.left = `${car.x * this.cellSize + 12 + 2}px`;
        el.style.top = `${car.y * this.cellSize + 12 + 2}px`;
    }

    handleCarClick(car, el) {
        if (car.isExiting || car.isMoving || this.isGameOver) return;
        car.isMoving = true;

        const maxCoord = this.boardSize - car.len;
        const startCoord = car.dir === 'h' ? car.x : car.y;
        
        const stepFwd = (car.facing === 'right' || car.facing === 'down') ? 1 : -1;
        const stepBack = -stepFwd;
        
        let canExitFwd = false;
        let canExitBack = false;
        
        // check forward path
        let openFwd = 0;
        let c = startCoord + stepFwd;
        let hitEdgeFwd = false;
        while(true) {
            if (c < 0 || c > maxCoord) { hitEdgeFwd = true; break; }
            if (!this.canOccupied(car, c)) break;
            openFwd++;
            c += stepFwd;
        }
        if (hitEdgeFwd) canExitFwd = true;
        
        // check back path
        let openBack = 0;
        c = startCoord + stepBack;
        let hitEdgeBack = false;
        while(true) {
            if (c < 0 || c > maxCoord) { hitEdgeBack = true; break; }
            if (!this.canOccupied(car, c)) break;
            openBack++;
            c += stepBack;
        }
        if (hitEdgeBack) canExitBack = true;
        
        let targetCoord;
        let exitDir = null;
        
        if (canExitFwd) {
            targetCoord = startCoord + (stepFwd * (openFwd + 1));
            exitDir = car.dir === 'h' ? (targetCoord < 0 ? 'left' : 'right') : (targetCoord < 0 ? 'up' : 'down');
        } else if (canExitBack) {
            targetCoord = startCoord + (stepBack * (openBack + 1));
            exitDir = car.dir === 'h' ? (targetCoord < 0 ? 'left' : 'right') : (targetCoord < 0 ? 'up' : 'down');
        } else {
            if (openFwd > 0) {
                targetCoord = startCoord + (stepFwd * openFwd);
            } else if (openBack > 0) {
                targetCoord = startCoord + (stepBack * openBack);
            } else {
                car.isMoving = false;
                return;
            }
        }
        
        if (car.dir === 'h') car.x = targetCoord;
        else car.y = targetCoord;
        
        if (exitDir) {
            this.exitCar(car, el, exitDir);
        } else {
            this.updateCarElementPosition(el, car);
            
            // This is a CRASH because the car did not exit
            el.classList.add('crash-shake');
            setTimeout(() => el.classList.remove('crash-shake'), 400);

            this.lives--;
            this.updateLivesDisplay();

            if (this.lives <= 0) {
                setTimeout(() => this.triggerGameOver("lives"), 400);
            }

            setTimeout(() => car.isMoving = false, 150);
        }
    }



    canOccupied(car, newPos) {
        const otherCars = this.cars.filter(c => c.id !== car.id && !c.isExiting);
        for (const other of otherCars) {
            if (car.dir === 'h') {
                if (this.isOverlapping(newPos, car.y, car.len, car.dir, other.x, other.y, other.len, other.dir)) return false;
            } else {
                if (this.isOverlapping(car.x, newPos, car.len, car.dir, other.x, other.y, other.len, other.dir)) return false;
            }
        }
        for (const obs of this.obstacles) {
            if (car.dir === 'h') {
                if (this.isOverlapping(newPos, car.y, car.len, car.dir, obs.x, obs.y, 1, 'h')) return false;
            } else {
                if (this.isOverlapping(car.x, newPos, car.len, car.dir, obs.x, obs.y, 1, 'h')) return false;
            }
        }
        return true;
    }

    isOverlapping(x1, y1, len1, dir1, x2, y2, len2, dir2) {
        const p1 = [];
        for (let i = 0; i < len1; i++) p1.push(dir1 === 'h' ? {x: x1+i, y: y1} : {x: x1, y: y1+i});
        const p2 = [];
        for (let i = 0; i < len2; i++) p2.push(dir2 === 'h' ? {x: x2+i, y: y2} : {x: x2, y: y2+i});
        
        return p1.some(a => p2.some(b => a.x === b.x && a.y === b.y));
    }



    exitCar(car, el, exitDirection) {
        car.isExiting = true;
        el.classList.add(`exiting-${exitDirection}`);

        this.activeCarsCount--;

        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);

            if (this.activeCarsCount <= 0 && !this.isGameOver) {
                this.showWinOverlay();
            }
        }, 600);
    }

    showWinOverlay() {
        this.isGameOver = true;
        if (this.timerInterval) clearInterval(this.timerInterval);

        if (this.currentLevel + 1 === this.unlockedLevels && this.unlockedLevels < this.levels.length) {
            this.unlockedLevels++;
            sessionStorage.setItem('parkingJamUnlocked', this.unlockedLevels);
        }

        // Calculate stars
        const timeRatio = this.timeLeft / this.originalTimeLimit;
        let starsEarned = 1;
        if (timeRatio >= 0.5) starsEarned = 3;
        else if (timeRatio >= 0.2) starsEarned = 2;

        // Save stars persistently
        const currentBest = this.levelStars[this.currentLevel] || 0;
        if (starsEarned > currentBest) {
            this.levelStars[this.currentLevel] = starsEarned;
            sessionStorage.setItem('parkingJamStars', JSON.stringify(this.levelStars));
        }

        // Enable star UI
        document.getElementById('star-rating').style.display = 'flex';
        document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
        if (starsEarned >= 1) document.getElementById('star-1').classList.add('active');
        if (starsEarned >= 2) document.getElementById('star-2').classList.add('active');
        if (starsEarned === 3) document.getElementById('star-3').classList.add('active');

        this.createConfetti();

        this.nextLevelBtn.style.display = 'inline-block';
        this.overlay.classList.remove('hidden');

        if (this.currentLevel === this.levels.length - 1) {
            document.getElementById('overlay-title').textContent = "ALL LEVELS CLEAR!";
            document.getElementById('overlay-desc').textContent = `You finished Parking Jam!`;
            this.nextLevelBtn.textContent = "HOME";
        } else {
            document.getElementById('overlay-title').textContent = "CONGRATULATIONS!";
            document.getElementById('overlay-desc').textContent = `Level Passed!`;
            this.nextLevelBtn.textContent = "NEXT LEVEL";
        }
    }

    createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}vw`;
            const colors = ['#f43f5e', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = `${Math.random() * 2 + 1}s`;
            confetti.style.animationDelay = `${Math.random()}s`;

            this.particlesContainer.appendChild(confetti);

            setTimeout(() => {
                if (this.particlesContainer.contains(confetti)) {
                    this.particlesContainer.removeChild(confetti);
                }
            }, 3000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ParkingJam();
});
