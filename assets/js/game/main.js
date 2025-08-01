// assets/js/game/main.js

/**
 * Карта соответствия ФИЗИЧЕСКОГО КОДА клавиши и игровых действий.
 * Использует event.code, чтобы работать независимо от раскладки клавиатуры.
 */
const keyMap = {
    // Стрелки
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    // WASD
    'KeyW': 'up',
    'KeyS': 'down',
    'KeyA': 'left',
    'KeyD': 'right'
};

/**
 * ОБРАБОТЧИКИ УПРАВЛЕНИЯ
 * Обновляют состояние в Game.controls на основе event.code.
 */
function handleKeyDown(e) {
    // Используем e.code вместо e.key
    const action = keyMap[e.code]; 
    if (action !== undefined) {
        e.preventDefault(); 
        Game.controls[action] = true;
    }

    // Выход по Escape работает как и раньше, т.к. его код 'Escape' совпадает с ключом
    if (e.code === 'Escape') {
        exitGame();
    }
}

function handleKeyUp(e) {
    // Используем e.code вместо e.key
    const action = keyMap[e.code];
    if (action !== undefined) {
        e.preventDefault();
        Game.controls[action] = false;
    }
}

/**
 * ФУНКЦИЯ ЗАПУСКА АКТИВНОГО ГЕЙМПЛЕЯ
 * Вызывается после всех стартовых анимаций.
 */
function startGameplay() {
    console.log("Gameplay ACTIVE!");
    Game.isActive = true;

    const prompt = document.querySelector('.game-start-prompt');
    if (prompt) {
        prompt.classList.remove('visible');
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

/**
 * ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ
 * Сердце игры, которое работает каждый кадр.
 */
function gameLoop(currentTime) {
    if (!document.body.classList.contains('game-active')) return;

    updateStars();
    
    if (Game.player.isFlyingIn) {
        updatePlayerFlyIn(currentTime);
    }
    
    if (Game.isActive) {
        updatePlayerPosition();
    }
    
    renderPlayer();

    requestAnimationFrame(gameLoop);
}


/**
 * ФУНКЦИЯ ЗАПУСКА ИГРЫ
 * Вызывается из app.js.
 */
function initGame() {
    if (document.body.classList.contains('game-active')) return;
    console.log("Game mode INITIALIZED.");

    document.body.classList.add('game-active');
    Game.bounds = {
        top: 80, 
        bottom: window.innerHeight - 80,
        left: (window.innerWidth / 2) - 350,
        right: (window.innerWidth / 2) + 350,
    };

    initStarsCanvas();
    createPlayer();
    const startPrompt = createStartPrompt();

    const totalAnimationTime = 1300; 

    setTimeout(() => {
        const starsCanvas = document.getElementById('stars-canvas');
        if (starsCanvas) starsCanvas.classList.add('visible');
        
        startPlayerFlyIn();
        if (startPrompt) startPrompt.classList.add('visible');
    }, totalAnimationTime);

    const timeUntilReady = totalAnimationTime + 800 + Game.settings.READY_UP_DELAY;
    setTimeout(() => {
        console.log("Game is ready to start.");
        Game.isReady = true;
        startGameplay();
    }, timeUntilReady);

    requestAnimationFrame(gameLoop);
}

/**
 * ФУНКЦИЯ ВЫХОДА ИЗ ИГРЫ
 */
function exitGame() {
    console.log("Exiting game...");
    
    document.body.classList.remove('game-active');
    
    Game.isActive = false;
    Game.isReady = false;
    Object.keys(Game.controls).forEach(action => Game.controls[action] = false);

    document.getElementById('stars-canvas')?.remove();
    document.getElementById('player-ship')?.remove();
    document.querySelector('.game-start-prompt')?.remove();

    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
}

// Привязываем initGame к window
window.initGame = initGame;