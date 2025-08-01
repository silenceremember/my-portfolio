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
 * ОБРАБОТЧИКИ УПРАВЛЕНИЯ
 */
function handleKeyDown(e) {
    const action = keyMap[e.code]; 
    if (action !== undefined) {
        e.preventDefault(); 
        Game.controls[action] = true;
    }
    if (e.code === 'Escape') {
        exitGame();
    }
}

function handleKeyUp(e) {
    const action = keyMap[e.code];
    if (action !== undefined) {
        e.preventDefault();
        Game.controls[action] = false;
    }
}

/**
 * ФУНКЦИЯ ЗАПУСКА АКТИВНОГО ГЕЙМПЛЕЯ
 */
function startGameplay() {
    console.log("Gameplay ACTIVE!");
    Game.isActive = true;
    const prompt = document.querySelector('.game-start-prompt');
    if (prompt) prompt.classList.remove('visible');
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

/**
 * ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ (ИСПРАВЛЕННОЕ УСЛОВИЕ)
 */
function gameLoop(currentTime) {
    // ИСПРАВЛЕНИЕ: Теперь цикл зависит от одного "главного" класса.
    // Он будет работать все время, пока идет запуск, игра или выход из нее.
    if (!document.body.classList.contains('game-mode')) return;
    
    updateStars();
    if (Game.player.isFlyingIn) updatePlayerFlyIn(currentTime);
    if (Game.isActive) updatePlayerPosition();
    renderPlayer();

    requestAnimationFrame(gameLoop);
}

/**
 * ФУНКЦИЯ ЗАПУСКА ИГРЫ (ИСПРАВЛЕННАЯ)
 */
function initGame() {
    if (document.body.classList.contains('game-mode')) return;
    console.log("Game mode INITIALIZED (Sequential).");

    document.body.classList.add('game-mode');

    // Шаг 1: Скрываем UI сайта (анимация 0.5с)
    document.querySelectorAll('.site-header, .site-footer, .sections-container').forEach(el => {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
    });

    // Шаг 2: ПОСЛЕ скрытия UI (через 500ms) - двигаем линии (анимация 0.8с)
    setTimeout(() => {
        document.body.classList.add('game-active');
    }, 500);

    // Подготовка игровых элементов в фоне
    Game.bounds = {
        top: 80, bottom: window.innerHeight - 80,
        left: (window.innerWidth / 2) - 350,
        right: (window.innerWidth / 2) + 350,
    };
    initStarsCanvas(); createPlayer(); const startPrompt = createStartPrompt();
    
    // Шаг 3: ПОСЛЕ сдвига линий (500 + 800 = 1300ms) - появляются игровые элементы
    const gameElementsAppearTime = 1300; 
    setTimeout(() => {
        const starsCanvas = document.getElementById('stars-canvas');
        if (starsCanvas) starsCanvas.classList.add('visible');
        startPlayerFlyIn();
        if (startPrompt) startPrompt.classList.add('visible');
    }, gameElementsAppearTime);

    // Шаг 4: Готовность к игре после всех анимаций
    const timeUntilReady = gameElementsAppearTime + 800 + Game.settings.READY_UP_DELAY;
    setTimeout(() => {
        Game.isReady = true;
        startGameplay();
    }, timeUntilReady);

    requestAnimationFrame(gameLoop);
}

/**
 * ФУНКЦИЯ ВЫХОДА ИЗ ИГРЫ (ИСПРАВЛЕННАЯ)
 */
function exitGame() {
    if (Game.isShuttingDown || !document.body.classList.contains('game-mode')) return;

    console.log("Exiting game sequentially...");
    Game.isShuttingDown = true;
    
    Game.isActive = false; Game.isReady = false;
    Object.keys(Game.controls).forEach(action => Game.controls[action] = false);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);

    // Шаг 1: Начинаем растворять игровые элементы (анимация 0.5с)
    const playerShip = document.getElementById('player-ship');
    const starsCanvas = document.getElementById('stars-canvas');
    const startPrompt = document.querySelector('.game-start-prompt');
    if (playerShip) playerShip.classList.remove('visible');
    if (starsCanvas) starsCanvas.classList.remove('visible');
    if (startPrompt) startPrompt.classList.remove('visible');
    
    // Шаг 2: ПОСЛЕ растворения (через 500ms) - двигаем линии назад (анимация 0.8с)
    setTimeout(() => {
        document.body.classList.remove('game-active');
    }, 500);

    // Шаг 3: ПОСЛЕ возврата линий (500 + 800 = 1300ms) - возвращаем UI сайта (анимация 0.5с)
    setTimeout(() => {
        document.querySelectorAll('.site-header, .site-footer, .sections-container').forEach(el => {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
        });
    }, 1300);

    // Шаг 4: ПОСЛЕ всех анимаций (1300 + 500 = 1800ms) - убираем мусор
    setTimeout(() => {
        console.log("Cleanup complete. Game mode OFF.");
        playerShip?.remove();
        starsCanvas?.remove();
        startPrompt?.remove();
        Game.isShuttingDown = false;
        document.body.classList.remove('game-mode');
    }, 1800);
}

// Привязываем initGame к window
window.initGame = initGame;