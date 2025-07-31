// assets/js/game/main.js

const Game = {
    isActive: false,
    player: {
        el: null, x: 0, y: 0, width: 30, height: 25,
        isFlyingIn: false,
        flyIn: { startY: 0, targetY: 0, duration: 800, startTime: 0 }
    },
    keys: new Set(),
    bullets: [],
    enemies: [],
    stars: [],
    settings: {
        playerSpeed: 7, bulletSpeed: 12, fireCooldown: 150,
        readyUpDelay: 2000, starCount: 150, enemyBaseSpeed: 0.5
    },
    bounds: { top: 0, bottom: 0, left: 0, right: 0 },
    canFire: true,
    canvas: null,
    ctx: null
};

function initGame() {
    if (document.body.classList.contains('game-active')) return;
    console.log("Game mode INITIALIZED.");

    const body = document.body;
    let gameIsReady = false;

    body.classList.add('game-active');

    const framePaddingVertical = 80;
    const gameFieldWidth = 700;
    Game.bounds.top = framePaddingVertical;
    Game.bounds.bottom = window.innerHeight - framePaddingVertical;
    Game.bounds.left = (window.innerWidth / 2) - (gameFieldWidth / 2);
    Game.bounds.right = (window.innerWidth / 2) + (gameFieldWidth / 2);

    initStarsCanvas();
    createGameUI();
    createPlayer();

    const startPrompt = document.querySelector('.game-start-prompt');
    
    const totalAnimationTime = 2100;
    setTimeout(() => {
        startPlayerFlyIn();
        if (startPrompt) startPrompt.classList.add('visible');
    }, 100);
    setTimeout(() => {
        console.log("Game is ready to start.");
        gameIsReady = true;
    }, totalAnimationTime + Game.settings.readyUpDelay);

    requestAnimationFrame(gameLoop);

    function startGameLoop() {
        if (Game.isActive) return;
        Game.isActive = true;
        console.log("GAME STARTED!");
        
        showGameUI();
        if (startPrompt) startPrompt.remove();
        
        loadLevel(1);
        
        window.addEventListener('keydown', handleGameKeys);
        window.addEventListener('keyup', handleGameKeys);
        window.removeEventListener('keydown', startGameTrigger);
    }
    function startGameTrigger(event) {
        if (!gameIsReady) return;
        const key = event.code;
        if (key === 'KeyW' || key === 'KeyA' || key === 'KeyS' || key === 'KeyD' || key === 'Space') {
            startGameLoop();
        }
    }
    
    window.addEventListener('keydown', startGameTrigger);
    window.addEventListener('keydown', handleGlobalKeys);
}

function handleGlobalKeys(event) {
    if (!document.body.classList.contains('game-active')) return;
    if (event.code === 'Escape') {
        window.removeEventListener('keydown', handleGlobalKeys);
        try {
            window.removeEventListener('keydown', startGameTrigger);
            window.removeEventListener('keydown', handleGameKeys);
            window.removeEventListener('keyup', handleGameKeys);
        } catch (e) {}
        console.log("Exiting game, reloading page.");
        window.location.reload();
    }
}

function handleGameKeys(event) {
    if (event.type === 'keydown') {
        Game.keys.add(event.code);
    } else if (event.type === 'keyup') {
        Game.keys.delete(event.code);
    }
}

function gameLoop() {
    if (!document.body.classList.contains('game-active')) return;
    updateStars();
    if (Game.player.isFlyingIn) { updatePlayerFlyIn(); }
    if (Game.isActive) {
        updatePlayerPosition();
        handleShooting();
        moveBullets();
        updateEnemies();
        checkCollisions();
    }
    if (Game.player.el) { renderPlayer(); }
    renderEnemies();
    requestAnimationFrame(gameLoop);
}

// Добавляем главную функцию в глобальную область видимости
if (typeof window.initGame === 'undefined') {
    window.initGame = initGame;
}