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
 * ОБРАБОТЧИКИ УПРАВЛЕНИЯ КЛАВИАТУРОЙ (для активной игры)
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
    cursorIdleTimer = setTimeout(hideCursor, 1000);
}

// ======================================================
// === ЛОГИКА ЗАПУСКА ИГРЫ ПО ДЕЙСТВИЮ ИГРОКА =========
// ======================================================

function handlePreGameInput(e) {
    // Сначала проверяем выход, так как он имеет приоритет
    if (e.code === 'Escape') {
        exitGame();
        return; // Выходим из функции
    }

    // Затем проверяем старт игры
    if (!Game.isReadyToPlay || !keyMap[e.code]) return;

    console.log("First player input detected. Starting gameplay!");
    startGameplay();
}

function startGameplay() {
    Game.isActive = true;
    document.querySelector('.game-start-prompt')?.classList.remove('visible');
    window.removeEventListener('keydown', handlePreGameInput);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

// ======================================================

/**
 * ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
 */
function gameLoop(currentTime) {
    // Эта проверка - единственный "выключатель" цикла.
    if (!document.body.classList.contains('game-mode')) return;
    
    updateStars();
    if (Game.player.isFlyingIn) updatePlayerFlyIn(currentTime);
    if (Game.isActive) updatePlayerPosition();
    renderPlayer();

    // ИСПРАВЛЕНИЕ: Мы всегда запрашиваем следующий кадр.
    // Это гарантирует, что звезды будут двигаться во время анимации выхода.
    // Цикл остановится сам, когда проверка выше вернет true.
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
    window.addEventListener('mousemove', showCursor);
    hideCursor();

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

    const timeUntilReady = gameElementsAppearTime + 800;
    setTimeout(() => {
        console.log("Game is ready. Waiting for player input...");
        Game.isReadyToPlay = true;
        window.addEventListener('mousemove', showCursor);
        window.addEventListener('keydown', handlePreGameInput);
    }, timeUntilReady);

    requestAnimationFrame(gameLoop);
}

/**
 * ФУНКЦИЯ ВЫХОДА ИЗ ИГРЫ
 */
function exitGame() {
    // Флаг isShuttingDown все еще полезен, чтобы предотвратить повторный вызов этой функции
    if (Game.isShuttingDown || !document.body.classList.contains('game-mode')) return;
    console.log("Exiting game sequentially...");
    Game.isShuttingDown = true;
    
    Game.isActive = false; Game.isReadyToPlay = false;
    Object.keys(Game.controls).forEach(action => Game.controls[action] = false);
    
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handlePreGameInput);

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
        
        Game.isShuttingDown = false; // Сбрасываем флаг на всякий случай
        document.body.classList.remove('game-mode'); // Это остановит gameLoop
    }, 1800);
}

window.initGame = initGame;