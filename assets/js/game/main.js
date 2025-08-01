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
    showGameUI();
    window.removeEventListener('keydown', handlePreGameInput);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

// ======================================================

/**
 * ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
 */
function gameLoop(currentTime) {
    if (!document.body.classList.contains('game-mode')) return;
    updateStars();
    if (Game.player.isFlyingIn) updatePlayerFlyIn(currentTime);
    
    if (Game.isActive) {
        // --- Логика расхода HP ---
        // Расход -0.5% в секунду.
        // requestAnimationFrame вызывается примерно 60 раз в секунду.
        // Значит, за один кадр нужно вычесть 0.5 / 60.
        const hpLossPerFrame = 0.5 / 60;
        Game.hp -= hpLossPerFrame;

        // Проверяем, не закончились ли HP
        if (Game.hp <= 0) {
            Game.hp = 0;
            console.log("GAME OVER - HP is 0");
            // Здесь будет логика смерти
            // Например, Game.isActive = false;
        }

        updatePlayerPosition();
        updateHpBar();
        updateLevelIndicators();
    }
    
    renderPlayer();
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
    initStarsCanvas(); createPlayer(); const startPrompt = createStartPrompt(); createGameUI(); 
    
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
 * ФУНКЦИЯ ВЫХОДА ИЗ ИГРЫ (с корректным сбросом состояния)
 */
function exitGame() {
    // Защита от повторного вызова
    if (Game.isShuttingDown || !document.body.classList.contains('game-mode')) return;
    console.log("Exiting game sequentially...");
    
    // Устанавливаем флаг, что мы в процессе выхода
    Game.isShuttingDown = true;
    
    // Немедленно отключаем все обработчики, чтобы предотвратить ввод
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('keydown', handlePreGameInput);
    window.removeEventListener('mousemove', showCursor);
    if (cursorIdleTimer) clearTimeout(cursorIdleTimer);
    
    // Принудительно показываем курсор
    document.getElementById('game-cursor-blocker')?.classList.remove('is-hidden');

    // Запускаем анимации растворения игровых элементов
    document.getElementById('player-ship')?.classList.remove('visible');
    document.getElementById('stars-canvas')?.classList.remove('visible');
    document.querySelector('.game-start-prompt')?.classList.remove('visible');
    document.querySelector('.game-ui-top')?.classList.remove('visible');
    document.querySelector('.game-ui-bottom')?.classList.remove('visible');
    
    // Запускаем анимацию возврата линий (через 0.5с)
    setTimeout(() => { 
        document.body.classList.remove('game-active'); 
    }, 500);

    // Запускаем анимацию появления UI сайта (через 1.3с)
    setTimeout(() => {
        const siteUI = document.querySelectorAll('.site-header, .site-footer, .sections-container');
        siteUI.forEach(el => {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
        });
    }, 1300);

    // Финальная очистка и сброс состояния после всех анимаций
    setTimeout(() => {
        console.log("Cleanup complete. Game mode OFF.");
        
        // Удаляем все созданные элементы
        document.getElementById('player-ship')?.remove();
        document.getElementById('stars-canvas')?.remove();
        document.querySelector('.game-start-prompt')?.remove();
        document.querySelector('.game-ui-top')?.remove();
        document.querySelector('.game-ui-bottom')?.remove();
        document.getElementById('game-cursor-blocker')?.remove();
        
        // ИСПРАВЛЕНИЕ: Вызываем функцию полного сброса состояния
        resetGameState();
        
        // Убираем главный класс, чтобы остановить gameLoop
        document.body.classList.remove('game-mode');
    }, 1800);
}

window.initGame = initGame;