// assets/js/game/main.js

/**
 * Карта соответствия ФИЗИЧЕСКОГО КОДА клавиши и игровых действий.
 */
const keyMap = {
    'ArrowUp': 'up', 'KeyW': 'up',
    'ArrowDown': 'down', 'KeyS': 'down',
    'ArrowLeft': 'left', 'KeyA': 'left',
    'ArrowRight': 'right', 'KeyD': 'right'
};

let hasStartedMoving = false; // Флаг: игрок уже начал двигаться?
let lastTime = 0; // Для расчета deltaTime

/**
 * ОСНОВНОЙ обработчик нажатия клавиш.
 * Он один и работает всегда после готовности игры.
 */
function handleGameInput(e) {
    // 1. Выход по ESC работает всегда
    if (e.code === 'Escape') {
        exitGame();
        return;
    }

    // 2. Обрабатываем движение
    const action = keyMap[e.code]; 
    if (action !== undefined) {
        e.preventDefault(); 
        
        // Если это первое нажатие клавиши движения...
        if (!hasStartedMoving) {
            console.log("First player movement detected. Starting UI and Scenario.");
            hasStartedMoving = true;
            
            // Запускаем UI и сценарий
            document.querySelector('.game-start-prompt')?.classList.remove('visible');
            showGameUI();
            startScenario();
        }
        
        Game.controls[action] = true;
    }
    
    // --- Тестовый код ---
    if (e.code === 'KeyT') {
        if (Game.hp > 0) {
            const oldHp = Game.hp;
            Game.hp -= 20;
            if (Game.hp < 0) Game.hp = 0;
            shakeHpBar();
            updateHpBar(oldHp);
        }
    }
    if (e.code === 'KeyY') {
        if (Game.hp < 100) {
            const oldHp = Game.hp;
            Game.hp += 20;
            if (Game.hp > 100) Game.hp = 100;
            updateHpBar(oldHp); 
        }
    }
    if (e.code === 'KeyN' && Game.phase === 'level') {
        endCurrentLevel();
    }
}

/**
 * Обработчик отпускания клавиш.
 */
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
/**
 * ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ
 */
function gameLoop(currentTime) {
    if (!document.body.classList.contains('game-mode')) return;
    
    if (lastTime === 0) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Сценарий работает, только если игрок начал двигаться
    if (hasStartedMoving) {
        updateScenario(deltaTime);
    }
    
    updateStars();
    if (Game.player.isFlyingIn) {
        updatePlayerFlyIn(currentTime);
    }
    
    // Движение игрока зависит от Game.isActive
    if (Game.isActive) {
        updatePlayerPosition();
    }
    
    // Геймплей и UI обновляются, только если игрок начал двигаться
    if (hasStartedMoving) {
        const oldHp = Game.hp;
        if (Game.phase === 'level') {
            const hpLossPerSecond = 0.5;
            Game.hp -= hpLossPerSecond * deltaTime;
        }

        if (Game.hp <= 0) {
            Game.hp = 0;
            console.log("GAME OVER - HP is 0");
            Game.isActive = false;
        }

        updateHpBar(oldHp); 
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

    // Сбрасываем флаги при каждом новом старте
    hasStartedMoving = false;
    lastTime = 0;
    resetGameState();

    document.body.classList.add('game-mode');

    const cursorBlocker = document.createElement('div');
    cursorBlocker.id = 'game-cursor-blocker';
    document.body.appendChild(cursorBlocker);
    window.addEventListener('mousemove', showCursor);
    hideCursor();

    const siteUI = document.querySelectorAll('.site-header, .site-footer, .sections-container');
    siteUI.forEach(el => { el.style.opacity = '0'; el.style.pointerEvents = 'none'; });

    setTimeout(() => { document.body.classList.add('game-active'); }, 500);

    Game.bounds = {
        top: 80, bottom: window.innerHeight - 80,
        left: (window.innerWidth / 2) - 350,
        right: (window.innerWidth / 2) + 350,
    };
    initStarsCanvas(); createPlayer(); createStartPrompt(); createGameUI(); 
    
    const gameElementsAppearTime = 1300; 
    setTimeout(() => {
        document.getElementById('stars-canvas')?.classList.add('visible');
        startPlayerFlyIn();
        document.querySelector('.game-start-prompt')?.classList.add('visible');
    }, gameElementsAppearTime);

    // Этот таймер теперь только включает управление и вешает главный слушатель
    const timeUntilReady = gameElementsAppearTime + 800;
    setTimeout(() => {
        console.log("Game is ready. Player can move now.");
        Game.isActive = true; // <-- ВКЛЮЧАЕМ УПРАВЛЕНИЕ
        
        window.addEventListener('keydown', handleGameInput);
        window.addEventListener('keyup', handleKeyUp);
    }, timeUntilReady);

    requestAnimationFrame(gameLoop);
}

/**
 * ФУНКЦИЯ ВЫХОДА ИЗ ИГРЫ
 */
function exitGame() {
    if (Game.isShuttingDown || !document.body.classList.contains('game-mode')) return;
    console.log("Exiting game sequentially...");
    Game.isShuttingDown = true;
    
    // Удаляем все активные слушатели
    window.removeEventListener('keydown', handleGameInput);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('mousemove', showCursor);
    if (cursorIdleTimer) clearTimeout(cursorIdleTimer);
    
    document.getElementById('game-cursor-blocker')?.classList.remove('is-hidden');

    // Анимации выхода
    document.getElementById('player-ship')?.classList.remove('visible');
    document.getElementById('stars-canvas')?.classList.remove('visible');
    document.querySelector('.game-start-prompt')?.classList.remove('visible');
    document.querySelector('.game-ui-top')?.classList.remove('visible');
    document.querySelector('.game-ui-bottom')?.classList.remove('visible');
    
    setTimeout(() => { document.body.classList.remove('game-active'); }, 500);

    setTimeout(() => {
        const siteUI = document.querySelectorAll('.site-header, .site-footer, .sections-container');
        siteUI.forEach(el => {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
        });
    }, 1300);

    // Финальная очистка
    setTimeout(() => {
        console.log("Cleanup complete. Game mode OFF.");
        document.getElementById('player-ship')?.remove();
        document.getElementById('stars-canvas')?.remove();
        document.querySelector('.game-start-prompt')?.remove();
        document.getElementById('game-cursor-blocker')?.remove();
        destroyGameUI();
        
        // Сбрасываем состояние после удаления элементов
        resetGameState(); 
        
        document.body.classList.remove('game-mode');
    }, 1800);
}

window.initGame = initGame;