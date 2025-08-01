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
    console.log("Game mode INITIALIZED.");

    // ИСПРАВЛЕНИЕ: Немедленно добавляем "главный выключатель", чтобы gameLoop начал работать.
    document.body.classList.add('game-mode');

    // 1. Скрываем UI сайта (0.5 сек)
    document.querySelectorAll('.site-header, .site-footer, .sections-container').forEach(el => {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
    });

    // 2. После скрытия UI - двигаем линии (0.8 сек)
    setTimeout(() => {
        document.body.classList.add('game-active'); // Этот класс теперь только для визуала
    }, 500);

    // Подготовка игровых элементов
    Game.bounds = {
        top: 80, bottom: window.innerHeight - 80,
        left: (window.innerWidth / 2) - 350,
        right: (window.innerWidth / 2) + 350,
    };
    initStarsCanvas(); createPlayer(); const startPrompt = createStartPrompt();
    
    // 3. После сдвига линий - появляются игровые элементы
    const totalAnimationTime = 1300; 
    setTimeout(() => {
        const starsCanvas = document.getElementById('stars-canvas');
        if (starsCanvas) starsCanvas.classList.add('visible');
        startPlayerFlyIn();
        if (startPrompt) startPrompt.classList.add('visible');
    }, totalAnimationTime);

    // 4. Готовность к игре
    const timeUntilReady = totalAnimationTime + 800 + Game.settings.READY_UP_DELAY;
    setTimeout(() => {
        Game.isReady = true;
        startGameplay();
    }, timeUntilReady);

    // Запускаем игровой цикл. Теперь он не остановится сразу.
    requestAnimationFrame(gameLoop);
}

/**
 * ФУНКЦИЯ ВЫХОДА ИЗ ИГРЫ (ИСПРАВЛЕННАЯ)
 */
function exitGame() {
    if (Game.isShuttingDown || !document.body.classList.contains('game-mode')) return;

    console.log("Exiting game sequentially...");
    Game.isShuttingDown = true;
    
    // 1. Немедленно сбрасываем логику и управление
    Game.isActive = false;
    Game.isReady = false;
    Object.keys(Game.controls).forEach(action => Game.controls[action] = false);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);

    // 2. Начинаем растворять игровые элементы (0.5 сек)
    const playerShip = document.getElementById('player-ship');
    const starsCanvas = document.getElementById('stars-canvas');
    const startPrompt = document.querySelector('.game-start-prompt');
    if (playerShip) playerShip.classList.remove('visible');
    if (starsCanvas) starsCanvas.classList.remove('visible');
    if (startPrompt) startPrompt.classList.remove('visible');
    
    // 3. ПОСЛЕ растворения - двигаем линии назад
    setTimeout(() => {
        document.body.classList.remove('game-active');
    }, 500);

    // 4. ПОСЛЕ возврата линий - возвращаем UI сайта
    setTimeout(() => {
        document.querySelectorAll('.site-header, .site-footer, .sections-container').forEach(el => {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
        });
    }, 1300);

    // 5. ПОСЛЕ всех анимаций - убираем мусор и выключаем "главный выключатель"
    setTimeout(() => {
        console.log("Cleanup complete. Game mode OFF.");
        playerShip?.remove();
        starsCanvas?.remove();
        startPrompt?.remove();
        Game.isShuttingDown = false;
        
        // ИСПРАВЛЕНИЕ: Убираем главный класс в самом конце, чтобы цикл остановился корректно.
        document.body.classList.remove('game-mode');
    }, 1800);
}

// Привязываем initGame к window
window.initGame = initGame;