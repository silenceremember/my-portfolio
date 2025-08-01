/**
 * Карта соответствия ФИЗИЧЕСКОГО КОДА клавиши и игровых действий.
 */
const keyMap = {
    'ArrowUp': 'up', 'KeyW': 'up',
    'ArrowDown': 'down', 'KeyS': 'down',
    'ArrowLeft': 'left', 'KeyA': 'left',
    'ArrowRight': 'right', 'KeyD': 'right'
};

/**
 * ОБРАБОТЧИКИ УПРАВЛЕНИЯ КЛАВИАТУРОЙ
 */
function handleKeyDown(e) {
    const action = keyMap[e.code]; 
    if (action !== undefined) {
        e.preventDefault(); 
        Game.controls[action] = true;
    }
    if (e.code === 'Escape') exitGame();
}

function handleKeyUp(e) {
    const action = keyMap[e.code];
    if (action !== undefined) {
        e.preventDefault();
        Game.controls[action] = false;
    }
}

// ======================================================
// === УПРАВЛЕНИЕ ВИДИМОСТЬЮ КУРСОРА ЧЕРЕЗ БЛОКИРАТОР ===
// ======================================================

let cursorIdleTimer = null;

function hideCursor() {
    const blocker = document.getElementById('game-cursor-blocker');
    if (blocker) blocker.classList.add('is-hidden');
}

function showCursor() {
    const blocker = document.getElementById('game-cursor-blocker');
    if (blocker) blocker.classList.remove('is-hidden');
    if (cursorIdleTimer) clearTimeout(cursorIdleTimer);
    cursorIdleTimer = setTimeout(hideCursor, 2500);
}

// ======================================================

function startGameplay() {
    console.log("Gameplay ACTIVE!");
    Game.isActive = true;
    document.querySelector('.game-start-prompt')?.classList.remove('visible');
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', showCursor);
    hideCursor();
}

/**
 * ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
 */
function gameLoop(currentTime) {
    // Эта проверка - единственный правильный способ остановить цикл.
    if (!document.body.classList.contains('game-mode')) return;
    
    updateStars();
    if (Game.player.isFlyingIn) updatePlayerFlyIn(currentTime);
    if (Game.isActive) updatePlayerPosition();
    renderPlayer();

    // ИСПРАВЛЕНИЕ: Мы всегда запрашиваем следующий кадр, пока 'game-mode' активен.
    // Это гарантирует, что звезды будут двигаться во время анимации выхода.
    requestAnimationFrame(gameLoop);
}

/**
 * ФУНКЦИЯ ЗАПУСКА ИГРЫ
 */
function initGame() {
    if (document.body.classList.contains('game-mode')) return;
    console.log("Game mode INITIALIZED (Sequential).");
    document.body.classList.add('game-mode');

    const cursorBlocker = document.createElement('div');
    cursorBlocker.id = 'game-cursor-blocker';
    document.body.appendChild(cursorBlocker);

    const siteUI = document.querySelectorAll('.site-header, .site-footer, .sections-container');
    siteUI.forEach(el => {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
    });

    setTimeout(() => { document.body.classList.add('game-active'); }, 500);

    Game.bounds = {
        top: 80, bottom: window.innerHeight - 80,
        left: (window.innerWidth / 2) - 350,
        right: (window.innerWidth / 2) + 350,
    };
    initStarsCanvas(); createPlayer(); const startPrompt = createStartPrompt();
    
    const gameElementsAppearTime = 1300; 
    setTimeout(() => {
        document.getElementById('stars-canvas')?.classList.add('visible');
        startPlayerFlyIn();
        document.querySelector('.game-start-prompt')?.classList.add('visible');
    }, gameElementsAppearTime);

    const timeUntilReady = gameElementsAppearTime + 800 + Game.settings.READY_UP_DELAY;
    setTimeout(() => {
        Game.isReady = true;
        startGameplay();
    }, timeUntilReady);

    requestAnimationFrame(gameLoop);
}

/**
 * ФУНКЦИЯ ВЫХОДА ИЗ ИГРЫ
 */
function exitGame() {
    // ВАЖНО: Мы больше не используем Game.isShuttingDown, так как цикл управляется иначе.
    if (!document.body.classList.contains('game-mode')) return;

    console.log("Exiting game sequentially...");
    
    Game.isActive = false; Game.isReady = false;
    Object.keys(Game.controls).forEach(action => Game.controls[action] = false);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('mousemove', showCursor);
    if (cursorIdleTimer) clearTimeout(cursorIdleTimer);
    document.getElementById('game-cursor-blocker')?.classList.remove('is-hidden');

    document.getElementById('player-ship')?.classList.remove('visible');
    document.getElementById('stars-canvas')?.classList.remove('visible');
    document.querySelector('.game-start-prompt')?.classList.remove('visible');
    
    setTimeout(() => { document.body.classList.remove('game-active'); }, 500);

    setTimeout(() => {
        const siteUI = document.querySelectorAll('.site-header, .site-footer, .sections-container');
        siteUI.forEach(el => {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
        });
    }, 1300);

    setTimeout(() => {
        console.log("Cleanup complete. Game mode OFF.");
        document.getElementById('player-ship')?.remove();
        document.getElementById('stars-canvas')?.remove();
        document.querySelector('.game-start-prompt')?.remove();
        document.getElementById('game-cursor-blocker')?.remove();
        
        // Цикл остановится сам на следующем кадре, когда увидит, что этого класса нет.
        document.body.classList.remove('game-mode'); 
    }, 1800);
}

window.initGame = initGame;