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

let isGameLoopActive = false;
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

/**
 * Рассчитывает и применяет положение игрового поля и его границ.
 */
function updateLayout() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Проверка на минимальный размер
    if (windowWidth < Game.settings.MIN_WINDOW_WIDTH || windowHeight < Game.settings.MIN_WINDOW_HEIGHT) {
        if (document.body.classList.contains('game-mode')) {
            exitGame();
        }
        return;
    }

    // Рассчитываем отступы от краев ОКНА до краев РАМКИ
    const offsetX = (windowWidth - Game.settings.GAME_WIDTH) / 2;
    const offsetY = (windowHeight - Game.settings.GAME_HEIGHT) / 2;

    // Обновляем виртуальные границы для логики игры
    Game.bounds = {
        top: offsetY,
        bottom: offsetY + Game.settings.GAME_HEIGHT,
        left: offsetX,
        right: offsetX + Game.settings.GAME_WIDTH
    };

    // --- ИЗМЕНЕНИЕ: Устанавливаем ТОЛЬКО 4 переменные для краев ---
    const root = document.documentElement;
    root.style.setProperty('--game-border-top', `${offsetY}px`);
    root.style.setProperty('--game-border-bottom', `${offsetY}px`);
    root.style.setProperty('--game-border-left', `${offsetX}px`);
    root.style.setProperty('--game-border-right', `${offsetX}px`); 
}

// ======================================================
/**
 * ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ
 */
function gameLoop(currentTime) {
    // 1. Главный "рубильник". Если флаг выключен - цикл полностью останавливается.
    if (!isGameLoopActive) {
        console.log("Game loop has been terminated.");
        return;
    }

    // 2. Анимация звезд работает всегда, пока активен цикл (даже при выходе).
    if (Game.canvas) {
        updateStars();
    }
    
    // 3. Основная игровая логика работает только если игра не в процессе выхода.
    if (!Game.isShuttingDown) {
        // Расчет deltaTime
        if (lastTime === 0) lastTime = currentTime;
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        
        // Логика сценария и появления игрока
        if (hasStartedMoving) {
            updateScenario(deltaTime);
        }
        if (Game.player.isFlyingIn) {
            updatePlayerFlyIn(currentTime);
        }
        
        // Логика управления и состояния игрока
        if (Game.isActive) {
            updatePlayerPosition();
        }
        
        // Логика геймплея (потеря HP, и т.д.)
        if (hasStartedMoving) {
            const oldHp = Game.hp;
            if (Game.phase === 'level') {
                const hpLossPerSecond = 0.5; // Пример
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
        
        // Отрисовка игрока на новой позиции
        renderPlayer();
    }
    
    // 4. Продолжаем цикл, запрашивая следующий кадр.
    requestAnimationFrame(gameLoop);
}

/**
 * ФУНКЦИЯ ЗАПУСКА ИГРЫ
 */
function initGame() {
    // Проверка, не запущена ли игра уже
    if (document.body.classList.contains('game-mode') || Game.isShuttingDown) {
        console.warn("Cannot start game: Game is already running or in the process of shutting down.");
        return false; // Немедленно выходим, ничего не делаем
    }
    
    // Первоначальный расчет макета
    updateLayout();

    // Проверка на минимальный размер окна
    if (window.innerWidth < Game.settings.MIN_WINDOW_WIDTH || window.innerHeight < Game.settings.MIN_WINDOW_HEIGHT) {
        if (typeof window.triggerQteSystemError === 'function') {
            const msg = `ТРЕБУЕТСЯ ОКНО ${Game.settings.MIN_WINDOW_WIDTH}x${Game.settings.MIN_WINDOW_HEIGHT}`;
            window.triggerQteSystemError(msg);
        }
        return false;
    }

    console.log("Game mode INITIALIZED.");

    // Сброс всех игровых состояний и флагов
    hasStartedMoving = false;
    lastTime = 0;
    resetGameState();

    // Устанавливаем флаг и запускаем игровой цикл, если он еще не запущен
    if (!isGameLoopActive) {
        isGameLoopActive = true;
        requestAnimationFrame(gameLoop);
    }

    // Добавляем классы для переключения в игровой режим
    document.body.classList.add('game-mode');
    document.body.classList.add('game-active'); // Если он все еще используется для каких-то стилей

    // Создаем игровые элементы
    initStarsCanvas(); 
    createPlayer(); 
    createStartPrompt(); 
    createGameUI(); 
    
    const cursorBlocker = document.createElement('div');
    cursorBlocker.id = 'game-cursor-blocker';
    document.body.appendChild(cursorBlocker);
    
    // Вешаем слушатели событий
    window.addEventListener('mousemove', showCursor);
    window.addEventListener('resize', updateLayout);

    // Скрываем основной UI сайта
    const siteUI = document.querySelectorAll('.site-header, .site-footer, .sections-container');
    siteUI.forEach(el => {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
    });

    // Запускаем анимации появления игровых элементов
    const gameElementsAppearTime = 500;
    setTimeout(() => {
        document.getElementById('stars-canvas')?.classList.add('visible');
        startPlayerFlyIn();
        document.querySelector('.game-start-prompt')?.classList.add('visible');
    }, gameElementsAppearTime);

    // Включаем управление после анимаций
    const timeUntilReady = gameElementsAppearTime + 800;
    setTimeout(() => {
        console.log("Game is ready. Player can move now.");
        Game.isActive = true;
        window.addEventListener('keydown', handleGameInput);
        window.addEventListener('keyup', handleKeyUp);
    }, timeUntilReady);

    return true;
}

/**
 * ФУНКЦИЯ ВЫХОДА ИЗ ИГРЫ
 */

function exitGame() {
    // 1. Проверка и установка флага "выхода"
    if (Game.isShuttingDown || !document.body.classList.contains('game-mode')) {
        return;
    }
    
    console.log("Exiting game sequentially...");
    Game.isShuttingDown = true; // Сигнал для gameLoop "успокоиться"
    
    // 2. Удаляем все активные слушатели
    window.removeEventListener('resize', updateLayout);
    window.removeEventListener('keydown', handleGameInput);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('mousemove', showCursor);
    if (cursorIdleTimer) {
        clearTimeout(cursorIdleTimer);
    }
    
    // 3. Возвращаем курсор
    document.getElementById('game-cursor-blocker')?.classList.remove('is-hidden');

    // 4. Запускаем анимации исчезновения игровых элементов
    document.getElementById('player-ship')?.classList.remove('visible');
    document.getElementById('stars-canvas')?.classList.remove('visible');
    document.querySelector('.game-start-prompt')?.classList.remove('visible');
    document.querySelector('.game-ui-top')?.classList.remove('visible');
    document.querySelector('.game-ui-bottom')?.classList.remove('visible');

    // 5. Запускаем анимацию возврата линий, убирая CSS-классы.
    // gameLoop продолжит работать и анимировать фон, т.к. isGameLoopActive еще true.
    const lineReturnDelay = 100;
    setTimeout(() => { 
        document.body.classList.remove('game-mode'); 
        document.body.classList.remove('game-active');
    }, lineReturnDelay);

    // 6. Показываем UI сайта после завершения анимации линий
    const lineAnimationDuration = 500;
    const siteAppearDelay = lineReturnDelay + lineAnimationDuration;
    setTimeout(() => {
        const siteUI = document.querySelectorAll('.site-header, .site-footer, .sections-container');
        siteUI.forEach(el => {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
        });
    }, siteAppearDelay);

    // 7. Финальная очистка и ОСТАНОВКА ЦИКЛА
    const siteAnimationDuration = 500;
    const cleanupDelay = siteAppearDelay + siteAnimationDuration;
    setTimeout(() => {
        console.log("Cleanup complete.");
        
        // Удаляем игровые DOM-элементы
        document.getElementById('player-ship')?.remove();
        document.getElementById('stars-canvas')?.remove();
        document.querySelector('.game-start-prompt')?.remove();
        document.getElementById('game-cursor-blocker')?.remove();
        destroyGameUI();
        
        // Очищаем CSS-переменные
        const root = document.documentElement;
        const propertiesToRemove = ['--game-border-top', '--game-border-bottom', '--game-border-left', '--game-border-right'];
        propertiesToRemove.forEach(prop => root.style.removeProperty(prop));
        
        // Сбрасываем состояние игры
        resetGameState(); 
        
        // Выключаем флаг, что приведет к полной остановке gameLoop на следующем кадре.
        isGameLoopActive = false;

    }, cleanupDelay);
}

window.initGame = initGame;