// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 576;

// Game State
let gameRunning = false;
let animationId = null;
let timer = 60;
let timerInterval = null;
let gameWinnerDeclared = false;

// Physics
const GRAVITY = 0.7;
const MODE_PVP = 'pvp';
const MODE_PVE = 'pve';
const CHARACTER_HUNTRESS = 'huntress';
const CHARACTER_HUNTER = 'hunter';
let selectedMode = null;
let selectedCharacter = null;

function getModeDisplayName(mode) {
    return mode === MODE_PVP ? 'Player vs Player' : 'Player vs AI';
}

function updateHowToInstructions() {
    const instructions = document.getElementById('modeInstructions');
    if (!selectedMode) {
        instructions.innerHTML = '<p>Select a game mode to see the controls and rules for that mode.</p>';
        return;
    }

    if (selectedMode === MODE_PVP) {
        instructions.innerHTML = `
            <p><strong>Mode:</strong> Player vs Player</p>
            <p>Both players fight on the same keyboard.</p>
            <ul>
                <li>Player 1: A / D → Move Left/Right</li>
                <li>Player 1: W → Jump</li>
                <li>Player 1: SPACE → Attack</li>
                <li>Player 2: ← / → → Move Left/Right</li>
                <li>Player 2: ↑ → Jump</li>
                <li>Player 2: ↓ → Attack</li>
            </ul>
            <p>Winner is declared when one player reaches 0 health or timer ends.</p>
        `;
    } else if (selectedMode === MODE_PVE) {
        if (selectedCharacter === CHARACTER_HUNTRESS) {
            instructions.innerHTML = `
                <p><strong>Mode:</strong> Player vs AI</p>
                <p>You control the Huntress while the Hunter is controlled by AI.</p>
                <ul>
                    <li>A / D → Move Left/Right</li>
                    <li>W → Jump</li>
                    <li>SPACE → Attack</li>
                </ul>
                <p>The AI Hunter will approach, attack, and retreat with a realistic cooldown.</p>
                <p>Win by reducing the AI health to zero or having more health when time runs out.</p>
            `;
        } else if (selectedCharacter === CHARACTER_HUNTER) {
            instructions.innerHTML = `
                <p><strong>Mode:</strong> Player vs AI</p>
                <p>You control the Hunter while the Huntress is controlled by AI.</p>
                <ul>
                    <li>← / → → Move Left/Right</li>
                    <li>↑ → Jump</li>
                    <li>↓ → Attack</li>
                </ul>
                <p>The AI Huntress will approach, attack, and retreat with a realistic cooldown.</p>
                <p>Win by reducing the AI health to zero or having more health when time runs out.</p>
            `;
        } else {
            instructions.innerHTML = '<p>Choose your character before starting Player vs AI.</p>';
        }
    }
}

function selectMode(mode) {
    selectedMode = mode;
    selectedCharacter = null;

    if (mode === MODE_PVE) {
        showScreen('charSelectScreen');
    } else {
        updateHowToInstructions();
        showScreen('howToScreen');
    }
}

function selectCharacter(character) {
    selectedCharacter = character;
    updateHowToInstructions();
    showScreen('howToScreen');
}

function isHumanPlayer1() {
    return selectedMode === MODE_PVP || (selectedMode === MODE_PVE && selectedCharacter === CHARACTER_HUNTRESS);
}

function isHumanPlayer2() {
    return selectedMode === MODE_PVP || (selectedMode === MODE_PVE && selectedCharacter === CHARACTER_HUNTER);
}

function getHumanPlayer() {
    return (selectedMode === MODE_PVE && selectedCharacter === CHARACTER_HUNTER) ? player2 : player1;
}

function getAIPlayer() {
    return (selectedMode === MODE_PVE && selectedCharacter === CHARACTER_HUNTER) ? player1 : player2;
}

const AI_CONFIG = {
    reactionDelay: 280,
    smallSpeed: 1.2,
    approachSpeed: 1.8,
    retreatSpeed: 1.2,
    attackRange: 140,
    attackCooldown: 1300,
    minimumDistance: 120,
    pauseChance: 0.25,
    pauseDuration: 600
};

let aiState = {
    nextDecisionTime: 0,
    lastAttackTime: 0,
    retreatUntil: 0,
    pauseUntil: 0,
    currentVelocity: 0,
    currentAction: 'idle'
};

// Sprites Base URLs (use local image assets from the img folder)
const SPRITES = {
    p1: {
        idle: { src: 'img/huntress/idle.png', frames: 8 },
        run: { src: 'img/huntress/run.png', frames: 8 },
        run_left: { src: 'img/huntress/run-left.png', frames: 8 },
        jump: { src: 'img/huntress/jump.png', frames: 2 },
        fall: { src: 'img/huntress/fall.png', frames: 2 },
        hit: { src: 'img/huntress/attack.png', frames: 5 },
        attacked: { src: 'img/huntress/hit.png', frames: 3 },
        dead: { src: 'img/huntress/dead.png', frames: 8 }
    },
    p2: {
        idle: { src: 'img/hunter/idle.png', frames: 10 },
        run: { src: 'img/hunter/run.png', frames: 8 },
        run_right: { src: 'img/hunter/run-right.png', frames: 8 },
        hit: { src: 'img/hunter/attack.png', frames: 7 },
        jump: { src: 'img/hunter/jump.png', frames: 3 },
        fall: { src: 'img/hunter/fall.png', frames: 3 },
        dead: { src: 'img/hunter/dead.png', frames: 11 },
        attacked: { src: 'img/hunter/attacked.png', frames: 3 }
    }
};

// Sound URLs (using working sound effects)
const SOUNDS = {
    hit: new Audio('https://www.soundjay.com/misc/sounds/sword-clash-01.mp3'),
    jump: new Audio('https://www.soundjay.com/misc/sounds/jump-01.mp3'),
    victory: new Audio('https://www.soundjay.com/misc/sounds/fanfare-01.mp3'),
    hunter_attack: new Audio('sounds/hunter knife.mp3'),
    huntress_attack: new Audio('sounds/huntress knife.mp3'),
    bg: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
};

// Set volumes
SOUNDS.hit.volume = 0.3;
SOUNDS.jump.volume = 0.2;
SOUNDS.victory.volume = 0.4;
SOUNDS.hunter_attack.volume = 0.6;
SOUNDS.huntress_attack.volume = 0.6;
SOUNDS.bg.volume = 0.1;
SOUNDS.bg.loop = true;

// Sprite Class
class Sprite {
    constructor({ position, imageSrc, scale = 1, frames = 1, offset = { x: 0, y: 0 } }) {
        this.position = position;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.frames = frames;
        this.currentFrame = 0;
        this.framesElapsed = 0;
        this.framesHold = 4;
        this.offset = offset;
        this.width = 50;
        this.height = 150;
    }

    draw() {
        const cropWidth = this.image.width / this.frames;
        ctx.drawImage(
            this.image,
            this.currentFrame * cropWidth,
            0,
            cropWidth,
            this.image.height,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            cropWidth * this.scale,
            this.image.height * this.scale
        );
    }

    animateFrames() {
        this.framesElapsed++;
        if (this.framesElapsed % this.framesHold === 0) {
            this.currentFrame = (this.currentFrame + 1) % this.frames;
        }
    }

    update() {
        this.draw();
        this.animateFrames();
    }
}

// Player Class
class Player extends Sprite {
    constructor({ position, velocity, sprites, attackOffset, name }) {
        super({
            position,
            imageSrc: sprites.idle.src,
            scale: name === 'p1' ? 3 : 2.6,
            frames: sprites.idle.frames,
            offset: name === 'p1' ? { x: 0, y: 160 } : { x: 0, y: 82 }
        });
        
        this.velocity = velocity;
        this.sprites = sprites;
        this.name = name;
        this.health = 100;
        this.attacking = false;
        this.dead = false;
        this.hitCooldown = false;
        this.currentSprite = 'idle';
        
        // Load all sprites
        for (const key in sprites) {
            const img = new Image();
            img.src = sprites[key].src;
            this.sprites[key].image = img;
            this.sprites[key].frames = sprites[key].frames;
        }
        
        this.attackRange = {
            position: { x: this.position.x, y: this.position.y },
            offset: attackOffset,
            width: 160,
            height: 50
        };
    }

    switchSprite(sprite) {
        if (this.dead && this.currentSprite === 'dead') return;
        if (this.image === this.sprites.hit?.image && this.currentFrame < this.sprites.hit.frames - 1) return;
        if (this.image === this.sprites.attacked?.image && this.currentFrame < this.sprites.attacked.frames - 1) return;
        if (this.currentSprite === sprite) return;
        
        const newSprite = this.sprites[sprite];
        if (newSprite && newSprite.image) {
            this.image = newSprite.image;
            this.frames = newSprite.frames;
            this.currentFrame = 0;
            this.currentSprite = sprite;
        }
    }

    update() {
        this.draw();
        if (!this.dead) this.animateFrames();
        
        // Update attack range
        this.attackRange.position.x = this.position.x + this.attackRange.offset.x;
        this.attackRange.position.y = this.position.y + this.attackRange.offset.y;
        
        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        
        // Ground collision
        if (this.position.y + this.height + this.velocity.y >= canvas.height - 60) {
            this.velocity.y = 0;
            this.position.y = canvas.height - 60 - this.height;
        } else {
            this.velocity.y += GRAVITY;
        }
        
        // Boundaries strictly within canvas
        this.position.x = Math.max(0, Math.min(this.position.x, canvas.width - this.width));
    }

    attack() {
        if (this.dead || this.attacking) return;
        this.switchSprite('hit');
        this.attacking = true;
        
        let atkSound = this.name === 'p1' ? SOUNDS.huntress_attack : SOUNDS.hunter_attack;
        atkSound.currentTime = 0;
        atkSound.play().catch(e => console.log('Audio play failed'));
    }

    takeDamage() {
        if (this.dead || this.hitCooldown) return;
        this.health = Math.max(0, this.health - 10);
        SOUNDS.hit.currentTime = 0;
        SOUNDS.hit.play().catch(e => console.log('Audio play failed'));
        
        // Hit flash effect
        const flash = document.createElement('div');
        flash.className = 'hit-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 100);
        
        this.hitCooldown = true;
        setTimeout(() => this.hitCooldown = false, 300);
        
        if (this.health <= 0) {
            this.dead = true;
            this.switchSprite('dead');
        } else {
            this.switchSprite('attacked');
        }
    }
}

// Game Objects
let player1, player2;
let keys = { a: false, d: false, ArrowLeft: false, ArrowRight: false };
let bgImage = new Image();
bgImage.src = 'img/bgforest2.png';

// Initialize Game
function initGame() {
    gameRunning = true;
    gameWinnerDeclared = false;
    timer = 60;
    document.getElementById('timerDisplay').innerText = timer;
    
    player1 = new Player({
        position: { x: 50, y: 0 },
        velocity: { x: 0, y: 0 },
        sprites: SPRITES.p1,
        attackOffset: { x: 100, y: 50 },
        name: 'p1'
    });
    
    player2 = new Player({
        position: { x: 800, y: 100 },
        velocity: { x: 0, y: 0 },
        sprites: SPRITES.p2,
        attackOffset: { x: -200, y: 70 },
        name: 'p2'
    });
    
    aiState.nextDecisionTime = 0;
    aiState.lastAttackTime = 0;
    aiState.retreatUntil = 0;
    
    updateHealthBars();
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (gameRunning && !gameWinnerDeclared && timer > 0) {
            timer--;
            document.getElementById('timerDisplay').innerText = timer;
            if (timer === 0) {
                declareWinner(player1.health > player2.health ? 'p1' : 'p2');
            }
        }
    }, 1000);
}

function updateHealthBars() {
    const p1Health = Math.max(0, (player1.health / 100) * 100);
    const p2Health = Math.max(0, (player2.health / 100) * 100);
    document.getElementById('p1Health').style.width = p1Health + '%';
    document.getElementById('p2Health').style.width = p2Health + '%';
}

function checkAttack() {
    // Player 1 attacks Player 2
    if (player1.attacking && !player1.dead && !player2.dead) {
        if (player1.attackRange.position.x + player1.attackRange.width >= player2.position.x &&
            player1.attackRange.position.x <= player2.position.x + player2.width &&
            player1.attackRange.position.y + player1.attackRange.height >= player2.position.y &&
            player1.attackRange.position.y <= player2.position.y + player2.height) {
            player2.takeDamage();
            player1.attacking = false;
            updateHealthBars();
            if (player2.health <= 0) declareWinner('p1');
        }
    }
    
    // Player 2 attacks Player 1
    if (player2.attacking && !player2.dead && !player1.dead) {
        if (player2.attackRange.position.x + player2.attackRange.width >= player1.position.x &&
            player2.attackRange.position.x <= player1.position.x + player1.width &&
            player2.attackRange.position.y + player2.attackRange.height >= player1.position.y &&
            player2.attackRange.position.y <= player1.position.y + player1.height) {
            player1.takeDamage();
            player2.attacking = false;
            updateHealthBars();
            if (player1.health <= 0) declareWinner('p2');
        }
    }
    
    // Reset attack flags after animation
    if (player1.attacking && player1.currentFrame >= player1.frames - 1) {
        player1.attacking = false;
    }
    if (player2.attacking && player2.currentFrame >= player2.frames - 1) {
        player2.attacking = false;
    }
}

function updateAI() {
    if (selectedMode !== MODE_PVE) return;
    const agent = getAIPlayer();
    const target = getHumanPlayer();
    if (!agent || !target || agent.dead || target.dead) return;

    const now = performance.now();
    const onGround = agent.velocity.y === 0;
    const dx = target.position.x - agent.position.x;
    const distance = Math.abs(dx);
    const canAttack = now - aiState.lastAttackTime > AI_CONFIG.attackCooldown;
    const retreat = now < aiState.retreatUntil;
    const paused = now < aiState.pauseUntil;
    const shouldPause = !paused && Math.random() < AI_CONFIG.pauseChance;

    if (now >= aiState.nextDecisionTime) {
        aiState.nextDecisionTime = now + AI_CONFIG.reactionDelay + Math.random() * 200;

        if (retreat) {
            aiState.currentVelocity = dx > 0 ? -AI_CONFIG.retreatSpeed : AI_CONFIG.retreatSpeed;
            aiState.currentAction = 'retreat';
        } else if (paused) {
            aiState.currentVelocity = 0;
            aiState.currentAction = 'idle';
        } else if (distance <= AI_CONFIG.attackRange) {
            if (canAttack && onGround && !agent.attacking && Math.random() < 0.75) {
                agent.attack();
                aiState.lastAttackTime = now;
                aiState.retreatUntil = now + 700 + Math.random() * 300;
                if (Math.random() < 0.45) {
                    aiState.pauseUntil = now + AI_CONFIG.pauseDuration + Math.random() * 400;
                }
                aiState.currentVelocity = 0;
                aiState.currentAction = 'attack';
            } else {
                if (distance < AI_CONFIG.minimumDistance) {
                    aiState.retreatUntil = now + 500 + Math.random() * 250;
                    aiState.currentVelocity = 0;
                    aiState.currentAction = 'idle';
                } else {
                    aiState.currentVelocity = dx > 0 ? AI_CONFIG.smallSpeed : -AI_CONFIG.smallSpeed;
                    aiState.currentAction = 'approach';
                }
            }
        } else {
            if (shouldPause && onGround && !agent.attacking) {
                aiState.pauseUntil = now + AI_CONFIG.pauseDuration * 0.5 + Math.random() * 300;
                aiState.currentVelocity = 0;
                aiState.currentAction = 'idle';
            } else {
                aiState.currentVelocity = dx > 0 ? AI_CONFIG.approachSpeed : -AI_CONFIG.approachSpeed;
                aiState.currentAction = 'approach';
            }
        }
    }

    agent.velocity.x = aiState.currentVelocity;
    if (!agent.attacking) {
        if (aiState.currentVelocity > 0) agent.switchSprite('run_right');
        else if (aiState.currentVelocity < 0) agent.switchSprite('run');
        else if (onGround) agent.switchSprite('idle');
    }
}

function declareWinner(winner) {
    if (gameWinnerDeclared) return;
    gameWinnerDeclared = true;
    gameRunning = false;
    
    SOUNDS.victory.play().catch(e => console.log('Audio play failed'));
    
    const winnerMessage = winner === 'p1' ? '🏆 HUNTRESS WINS! 🏆' : '🏆 HUNTER WINS! 🏆';
    document.getElementById('winnerMessage').innerText = winnerMessage;
    
    document.getElementById('winnerScreen').classList.add('active');
    
    if (animationId) cancelAnimationFrame(animationId);
}

function animate() {
    if (!gameRunning) return;
    
    // Draw the pixel art forest background requested by the user just for the playing canvas
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    
    // Smooth dark overlay
    ctx.fillStyle = 'rgba(5, 8, 15, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update players
    player1.update();
    player2.update();
    
    // Handle movement
    player1.velocity.x = 0;
    player2.velocity.x = 0;
    
    if (isHumanPlayer1()) {
        if (keys.a && !player1.dead) {
            player1.velocity.x = -5;
            player1.switchSprite('run_left');
        } else if (keys.d && !player1.dead) {
            player1.velocity.x = 5;
            player1.switchSprite('run');
        } else if (!player1.dead && player1.velocity.y === 0) {
            player1.switchSprite('idle');
        }
    }
    
    if (player1.velocity.y < 0) player1.switchSprite('jump');
    else if (player1.velocity.y > 0) player1.switchSprite('fall');
    
    if (isHumanPlayer2()) {
        if (keys.ArrowLeft && !player2.dead) {
            player2.velocity.x = -5;
            player2.switchSprite('run');
        } else if (keys.ArrowRight && !player2.dead) {
            player2.velocity.x = 5;
            player2.switchSprite('run_right');
        } else if (!player2.dead && player2.velocity.y === 0) {
            player2.switchSprite('idle');
        }
    }

    if (selectedMode === MODE_PVE) {
        updateAI();
    }
    
    if (player2.velocity.y < 0) player2.switchSprite('jump');
    else if (player2.velocity.y > 0) player2.switchSprite('fall');
    
    checkAttack();
    
    animationId = requestAnimationFrame(animate);
}

// Input Handling
function handleKeyDown(e) {
    if (!gameRunning || gameWinnerDeclared) return;
    
    switch(e.key) {
        case 'a': case 'A': if (isHumanPlayer1()) keys.a = true; break;
        case 'd': case 'D': if (isHumanPlayer1()) keys.d = true; break;
        case 'w': case 'W': 
            if (isHumanPlayer1() && !player1.dead && player1.velocity.y === 0) {
                player1.velocity.y = -20;
                SOUNDS.jump.play().catch(e => console.log('Audio play failed'));
            }
            break;
        case ' ': 
            if (isHumanPlayer1() && !player1.dead) player1.attack();
            break;
        case 'ArrowLeft':
            if (isHumanPlayer2()) keys.ArrowLeft = true;
            break;
        case 'ArrowRight':
            if (isHumanPlayer2()) keys.ArrowRight = true;
            break;
        case 'ArrowUp': 
            if (isHumanPlayer2() && !player2.dead && player2.velocity.y === 0) {
                player2.velocity.y = -20;
                SOUNDS.jump.play().catch(e => console.log('Audio play failed'));
            }
            break;
        case 'ArrowDown': 
            if (isHumanPlayer2() && !player2.dead) player2.attack();
            break;
    }
}

function handleKeyUp(e) {
    switch(e.key) {
        case 'a': case 'A': if (isHumanPlayer1()) keys.a = false; break;
        case 'd': case 'D': if (isHumanPlayer1()) keys.d = false; break;
        case 'ArrowLeft':
            if (isHumanPlayer2()) keys.ArrowLeft = false;
            break;
        case 'ArrowRight':
            if (isHumanPlayer2()) keys.ArrowRight = false;
            break;
    }
}

// Mobile Controls
function setupMobileControls() {
    const buttons = document.querySelectorAll('[data-action]');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const action = btn.dataset.action;
            handleMobileAction(action, true);
        });
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            const action = btn.dataset.action;
            handleMobileAction(action, false);
        });
        btn.addEventListener('mousedown', () => handleMobileAction(btn.dataset.action, true));
        btn.addEventListener('mouseup', () => handleMobileAction(btn.dataset.action, false));
    });
}

function handleMobileAction(action, isActive) {
    if (!gameRunning || gameWinnerDeclared) return;
    
    // In PVE, map mobile controls to the human player.
    // In PVP, default mobile controls to player1.
    const isHumanHunter = selectedMode === MODE_PVE && selectedCharacter === CHARACTER_HUNTER;
    
    switch(action) {
        case 'left':
            if (isHumanHunter) keys.ArrowLeft = isActive;
            else keys.a = isActive;
            break;
        case 'right':
            if (isHumanHunter) keys.ArrowRight = isActive;
            else keys.d = isActive;
            break;
        case 'jump':
            const human1 = isHumanHunter ? player2 : player1;
            if (isActive && human1 && !human1.dead && human1.velocity.y === 0) {
                human1.velocity.y = -20;
                SOUNDS.jump.play().catch(e => console.log('Audio play failed'));
            }
            break;
        case 'attack':
            const human2 = isHumanHunter ? player2 : player1;
            if (isActive && human2 && !human2.dead) human2.attack();
            break;
    }
}

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Event Listeners
document.getElementById('pvpModeBtn').addEventListener('click', () => selectMode(MODE_PVP));
document.getElementById('pveModeBtn').addEventListener('click', () => selectMode(MODE_PVE));
document.getElementById('playAsHuntressBtn').addEventListener('click', () => selectCharacter(CHARACTER_HUNTRESS));
document.getElementById('playAsHunterBtn').addEventListener('click', () => selectCharacter(CHARACTER_HUNTER));
document.getElementById('backToIntroFromCharBtn').addEventListener('click', () => {
    selectedMode = null;
    selectedCharacter = null;
    showScreen('introScreen');
});

document.getElementById('startGameBtn').addEventListener('click', () => {
    if (!selectedMode || (selectedMode === MODE_PVE && !selectedCharacter)) return;
    showScreen('gameScreen');
    initGame();
    animate();
    SOUNDS.bg.play().catch(e => console.log('Audio autoplay blocked'));
});

document.getElementById('quitBtn').addEventListener('click', () => toggleQuitModal(true));
document.getElementById('cancelQuitBtn').addEventListener('click', () => toggleQuitModal(false));
document.getElementById('confirmQuitBtn').addEventListener('click', () => {
    toggleQuitModal(false);
    if (animationId) cancelAnimationFrame(animationId);
    gameRunning = false;
    selectedMode = null;
    selectedCharacter = null;
    SOUNDS.bg.pause();
    SOUNDS.bg.currentTime = 0;
    showScreen('introScreen');
});

document.getElementById('backToIntroBtn').addEventListener('click', () => {
    selectedMode = null;
    selectedCharacter = null;
    updateHowToInstructions();
    showScreen('introScreen');
});

document.getElementById('rematchBtn').addEventListener('click', () => {
    showScreen('gameScreen');
    if (animationId) cancelAnimationFrame(animationId);
    initGame();
    animate();
});

document.getElementById('mainMenuBtn').addEventListener('click', () => {
    selectedMode = null;
    if (animationId) cancelAnimationFrame(animationId);
    gameRunning = false;
    showScreen('introScreen');
});

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const quitModal = document.getElementById('quitModal');
        if (quitModal && !quitModal.classList.contains('hidden')) {
            toggleQuitModal(false);
        }
    }
});

function toggleQuitModal(show) {
    const quitModal = document.getElementById('quitModal');
    if (!quitModal) return;
    quitModal.classList.toggle('hidden', !show);
}

setupMobileControls();

// Initial setup
showScreen('introScreen');