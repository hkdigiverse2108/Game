// main.js - Modern 3D Water Sort Puzzle Logic with Realistic Pour Animation

let gameActive = false;
let currentLevelIndex = 0;
let bottlesData = [];      
let originalBottlesData = [];
let selectedBottleIndex = null;
let moves = 0;
let isPouring = false;

let levelConfig = {
    0: { name: "EASY", bottleCount: 5, colorsCount: 3 },
    1: { name: "MEDIUM", bottleCount: 6, colorsCount: 4 },
    2: { name: "HARD", bottleCount: 7, colorsCount: 5 },
    3: { name: "VERY HARD", bottleCount: 8, colorsCount: 6 },
    7: { name: "IMPOSSIBLE", bottleCount: 12, colorsCount: 9 }
};

const colorPalette = [
    "#ef4444", "#3b82f6", "#eab308", "#22c55e", "#a855f7", "#86efac", "#7dd3fc", "#f97316", "#b45309", "#f472b6"
];
const colorNames = ["red", "blue", "yellow", "green", "purple", "lightgreen", "lightblue", "orange", "brown", "pink"];

const menuPanel = document.getElementById('menu-panel');
const gameContainer = document.getElementById('game-container');
const bottlesGrid = document.getElementById('bottles-grid');
const levelTitle = document.getElementById('level-title');
const movesCounter = document.getElementById('moves-counter');

const delay = ms => new Promise(res => setTimeout(res, ms));

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function initializeLevel(levelIdx) {
    const config = levelConfig[levelIdx];
    let colorPool = [];
    for (let i = 0; i < config.colorsCount; i++) {
        for (let j = 0; j < 4; j++) colorPool.push(i);
    }
    colorPool = shuffleArray(colorPool);
    
    let bottles = [];
    let idx = 0;
    for (let i = 0; i < config.bottleCount - 2; i++) {
        let bottle = [];
        for (let j = 0; j < 4; j++) bottle.push(colorPool[idx++]);
        bottles.push(bottle);
    }
    for (let i = 0; i < 2; i++) bottles.push(["empty", "empty", "empty", "empty"]);
    return shuffleArray(bottles);
}

function canPour(sourceBottle, destBottle) {
    let sourceTopColor = null;
    for (let i = 0; i < 4; i++) {
        if (sourceBottle[i] !== "empty") {
            sourceTopColor = sourceBottle[i];
            break;
        }
    }
    if (sourceTopColor === null) return false;
    
    let emptySlots = 0, destTopColor = null;
    for (let i = 0; i < 4; i++) {
        if (destBottle[i] === "empty") emptySlots++;
        else {
            if (destTopColor === null) destTopColor = destBottle[i];
        }
    }
    if (emptySlots === 0) return false;
    if (destTopColor === null) return true;
    return sourceTopColor === destTopColor;
}

function renderGame() {
    bottlesGrid.innerHTML = '';
    
    bottlesData.forEach((bottle, idx) => {
        const tube = document.createElement('div');
        tube.className = `tube-3d ${selectedBottleIndex === idx ? 'tube-selected' : ''}`;
        tube.setAttribute('data-index', idx);
        
        const cap = document.createElement('div');
        cap.className = 'tube-cap';
        tube.appendChild(cap);
        
        renderBottleInner(tube, bottle);
        
        tube.addEventListener('click', (e) => {
            e.stopPropagation();
            handleBottleClick(idx);
        });
        
        bottlesGrid.appendChild(tube);
    });
    
    movesCounter.innerText = moves;
}

function renderBottleInner(tube, bottle) {
    // Remove old liquid layers to redraw
    Array.from(tube.querySelectorAll('.liquid-layer, .empty-glow')).forEach(el => el.remove());
    
    // Stack layers from bottom up (index 3 to 0)
    let chunks = [];
    let currentChunk = null;
    
    for (let i = 3; i >= 0; i--) {
        let c = bottle[i];
        if (c !== "empty") {
            if (currentChunk && currentChunk.color === c) {
                currentChunk.units++;
            } else {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = { color: c, units: 1 };
            }
        } else {
            if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = null;
            }
        }
    }
    if (currentChunk) chunks.push(currentChunk);
    
    let currentBottom = 2; // Offset for border radius
    chunks.forEach((chunk, idx) => {
        let colorId = chunk.color;
        let colorClass = `liquid-color-${colorNames[colorId % colorNames.length]}`;
        
        const layerDiv = document.createElement('div');
        layerDiv.className = `liquid-layer ${colorClass}`;
        if (idx === 0) layerDiv.classList.add('bottom-layer');
        
        // 4 max units, each is ~22.5% height to leave some room at top
        layerDiv.style.height = `${chunk.units * 21.5}%`;
        layerDiv.style.bottom = `${currentBottom}%`;
        
        tube.appendChild(layerDiv);
        currentBottom += chunk.units * 21.5;
    });
    
    if (chunks.length === 0) {
        const emptyGlow = document.createElement('div');
        emptyGlow.className = 'empty-glow';
        tube.appendChild(emptyGlow);
    }
}

async function handleBottleClick(clickedIdx) {
    if (isPouring || !gameActive) return;
    
    if (selectedBottleIndex === null) {
        let isEmpty = bottlesData[clickedIdx].every(c => c === "empty");
        if (isEmpty) return; // Don't allow picking up empty bottle
        
        selectedBottleIndex = clickedIdx;
        renderGame();
    } else {
        if (selectedBottleIndex === clickedIdx) {
            selectedBottleIndex = null;
            renderGame();
            return;
        }
        
        if (canPour(bottlesData[selectedBottleIndex], bottlesData[clickedIdx])) {
            await performPourAnimation(selectedBottleIndex, clickedIdx);
        } else {
            const invalidTube = document.querySelector(`.tube-3d[data-index="${clickedIdx}"]`);
            if (invalidTube) {
                invalidTube.style.transform = 'translateY(-10px) translateX(8px)';
                setTimeout(() => { if(invalidTube) invalidTube.style.transform = ''; }, 150);
            }
            selectedBottleIndex = null;
            renderGame();
            
            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: 'error', title: 'Invalid Move',
                    toast: true, position: 'top-end', showConfirmButton: false, timer: 1000,
                    background: '#1a1f35', color: '#fff'
                });
            }
        }
    }
}

async function performPourAnimation(srcIdx, destIdx) {
    isPouring = true;
    document.body.classList.add('pouring-active');
    
    let sourceBottle = bottlesData[srcIdx];
    let destBottle = bottlesData[destIdx];
    
    let srcTopIdx = -1, srcColor = null, srcConsecutive = 0;
    for (let i = 0; i < 4; i++) {
        if (sourceBottle[i] !== "empty") {
            if (srcColor === null) {
                srcColor = sourceBottle[i];
                srcTopIdx = i;
                srcConsecutive = 1;
            } else if (sourceBottle[i] === srcColor) {
                srcConsecutive++;
            } else { break; }
        }
    }
    
    let destEmptyCount = 0;
    for (let i = 0; i < 4; i++) {
        if (destBottle[i] === "empty") destEmptyCount++;
        else break;
    }
    
    let pourAmount = Math.min(srcConsecutive, destEmptyCount);
    
    const srcTube = document.querySelector(`.tube-3d[data-index="${srcIdx}"]`);
    const destTube = document.querySelector(`.tube-3d[data-index="${destIdx}"]`);
    
    const srcRect = srcTube.getBoundingClientRect();
    const destRect = destTube.getBoundingClientRect();
    
    let isLeft = srcRect.left <= destRect.left;
    let tiltAngle = isLeft ? 80 : -80;
    
    // Spatial positioning
    let moveX = destRect.left - srcRect.left + (isLeft ? -srcRect.width/1.6 : destRect.width/1.6);
    let moveY = destRect.top - srcRect.top - srcRect.height/1.8;

    srcTube.style.zIndex = "100";
    srcTube.style.transformOrigin = isLeft ? "80% 10%" : "20% 10%";
    
    // Lift up and move to position
    srcTube.style.transform = `translate(${moveX}px, ${moveY}px) rotate(0deg)`;
    await delay(350);
    
    // Tilt the bottle
    srcTube.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${tiltAngle}deg)`;
    await delay(300);
    
    // Spawn stream matching color
    let colorClass = `liquid-color-${colorNames[srcColor % colorNames.length]}`;
    let stream = document.createElement('div');
    stream.className = `pour-stream ${colorClass}`;
    
    // Position stream mouth exactly at tip
    let spawnX = destRect.left + destRect.width/2 - 7;
    let spawnY = destRect.top - 20;
    stream.style.left = `${spawnX}px`;
    stream.style.top = `${spawnY}px`;
    document.body.appendChild(stream);
    
    // Fall Animation
    let fallDistance = srcRect.height * 0.7;
    setTimeout(() => { stream.style.height = `${fallDistance}px`; }, 20);
    await delay(200);

    // Dynamic level adjustment: empty source, fill target incrementally
    for(let p = 0; p < pourAmount; p++) {
        sourceBottle[srcTopIdx + p] = "empty";
        destBottle[destEmptyCount - 1 - p] = srcColor;
        
        renderBottleInner(srcTube, sourceBottle);
        renderBottleInner(destTube, destBottle);
        await delay(180);
    }
    
    // Stream detaches and falls away
    stream.style.transition = "top 0.2s linear, height 0.2s linear";
    stream.style.top = `${spawnY + fallDistance}px`;
    stream.style.height = `0px`;
    await delay(200);
    if(stream.parentNode) stream.remove();
    
    // Untilt bottle
    srcTube.style.transform = `translate(${moveX}px, ${moveY}px) rotate(0deg)`;
    await delay(300);
    
    // Return to original geometric flexbox position
    srcTube.style.transform = `translate(0px, 0px) rotate(0deg)`;
    await delay(350);
    
    srcTube.style.cssText = "";
    
    moves++;
    movesCounter.innerText = moves;
    
    isPouring = false;
    document.body.classList.remove('pouring-active');
    selectedBottleIndex = null;
    renderGame();
    
    if (checkWin()) {
        gameActive = false;
        setTimeout(showVictory, 300);
    }
}

function checkWin() {
    for (let bottle of bottlesData) {
        const fill = bottle.filter(c => c !== "empty");
        if (fill.length > 0 && fill.length < 4) return false;
        if (fill.length === 4 && !fill.every(c => c === fill[0])) return false;
    }
    return true;
}

function showVictory() {
    const overlay = document.createElement('div');
    overlay.className = 'victory-overlay';
    overlay.innerHTML = `
        <div class="victory-card relative overflow-hidden">
            <div class="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <div class="flex justify-center mb-6">
                <svg class="w-24 h-24 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2l2.928 6.062 6.696.974-4.845 4.723 1.144 6.671L10 17.29l-5.923 3.11 1.144-6.67-4.845-4.724 6.696-.974L10 2z" clip-rule="evenodd"></path></svg>
            </div>
            <h2 class="text-5xl font-extrabold text-white tracking-wide mb-4">LEVEL CLEARED</h2>
            <p class="text-gray-300 text-xl font-medium mb-8">Completed in <span class="text-cyan-400 font-bold text-3xl mx-1">${moves}</span> moves</p>
            <button id="victory-home-btn" class="w-full flex items-center justify-center gap-2 py-4 bg-white hover:bg-gray-100 rounded-2xl text-gray-900 font-bold text-xl shadow-xl transition-transform hover:scale-105 focus:scale-95">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                CONTINUE
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('victory-home-btn').addEventListener('click', () => {
        overlay.remove();
        showMenu();
    });
}

function restartLevel() {
    if (!gameActive || isPouring) return;
    bottlesData = originalBottlesData.map(bottle => [...bottle]);
    selectedBottleIndex = null; moves = 0;
    renderGame();
}

function openLevel(levelIdx) {
    currentLevelIndex = levelIdx;
    levelTitle.innerText = levelConfig[levelIdx].name;
    bottlesData = initializeLevel(levelIdx);
    originalBottlesData = bottlesData.map(b => [...b]);
    selectedBottleIndex = null; moves = 0;
    gameActive = true;
    menuPanel.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    renderGame();
}

function showMenu() {
    gameActive = false;
    gameContainer.classList.add('hidden');
    menuPanel.classList.remove('hidden');
}

document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => openLevel(parseInt(btn.getAttribute('data-level'))));
});

document.getElementById('restart-game-btn').addEventListener('click', restartLevel);
document.getElementById('home-game-btn').addEventListener('click', showMenu);

const rulesOverlay = document.getElementById('rules-overlay');
document.getElementById('rules-menu-btn').addEventListener('click', () => {
    rulesOverlay.classList.remove('invisible', 'opacity-0');
    rulesOverlay.classList.add('opacity-100', 'visible');
});
document.getElementById('close-rules-btn').addEventListener('click', () => {
    rulesOverlay.classList.remove('opacity-100', 'visible');
    rulesOverlay.classList.add('invisible', 'opacity-0');
});

window.addEventListener('resize', () => {
    if(gameActive && !isPouring) renderGame();
});

// Loader and Welcome Notification
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader-screen');
        const root = document.getElementById('app-root');
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 700);
        }
        if(root) {
            root.style.opacity = '1';
        }
    }, 1500);
});