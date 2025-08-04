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
window.hasStartedMoving = false;
window.lastTime = 0;

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
            hideCursor();

            // Эта функция теперь сама позаботится о контейнере
            convertPromptToEnemies();
            
            // Запускаем UI и сценарий
            // --- СТРОКА УДАЛЕНА ---
            // document.querySelector('.game-start-prompt')?.classList.remove('visible'); 
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
    const oldBounds = { ...Game.bounds };

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

        // --- ОТЛАДОЧНЫЙ БЛОК ---
        console.log("updateLayout called. GAME_WIDTH from settings is:", Game.settings.GAME_WIDTH);
        // -------------------------


    if (windowWidth < Game.settings.MIN_WINDOW_WIDTH || windowHeight < Game.settings.MIN_WINDOW_HEIGHT) {
        if (document.body.classList.contains('game-mode')) {
            exitGame();
        }
        return;
    }

    if (Game.canvas) {
        Game.canvas.width = windowWidth;
        Game.canvas.height = windowHeight;
        if (typeof handleStarfieldResize === 'function') {
            handleStarfieldResize();
        }
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

        // --- ЕЩЕ ОДИН ОТЛАДОЧНЫЙ БЛОК ---
        console.log(`Calculated offsets: offsetX=${offsetX}, offsetY=${offsetY}`);
        // ---------------------------------

    // --- ИЗМЕНЕНИЕ: Устанавливаем ТОЛЬКО 4 переменные для краев ---
    const root = document.documentElement;
    root.style.setProperty('--game-border-top', `${offsetY}px`);
    root.style.setProperty('--game-border-bottom', `${offsetY}px`);
    root.style.setProperty('--game-border-left', `${offsetX}px`);
    root.style.setProperty('--game-border-right', `${offsetX}px`);

    // --- ПЕРЕСЧЕТ ПОЗИЦИИ ИГРОКА ---
    if (Game.player.el && oldBounds.left !== undefined) {

        if (Game.player.isFlyingIn) {
            // ===========================================
            // === СОСТОЯНИЕ: АНИМАЦИЯ ВЫЛЕТА           ===
            // ===========================================

            // 1. Корректируем ГОРИЗОНТАЛЬНОЕ положение. Корабль всегда должен
            // лететь к центру НОВОЙ игровой зоны. Это исправляет "дрейф" в сторону.
            Game.player.x = Game.bounds.left + (Game.settings.GAME_WIDTH / 2);

            // 2. Корректируем ВЕРТИКАЛЬНУЮ ЦЕЛЬ анимации.
            // Мы меняем ТОЛЬКО 'targetY'. Функция updatePlayerFlyIn использует
            // оригинальные 'startY' и 'startTime', но теперь будет стремиться к новой
            // цели. Это создает плавную, естественную коррекцию курса без скачков.
            Game.player.flyIn.targetY = Game.bounds.bottom - Game.settings.PLAYER_HEIGHT - 20;

        } else {
            // ===========================================
            // === СОСТОЯНИЕ: ИГРОК ПОД УПРАВЛЕНИЕМ     ===
            // ===========================================
            // (Эта логика из самого первого решения, она верна для этого состояния)

            const oldGameWidth = oldBounds.right - oldBounds.left;
            const oldGameHeight = oldBounds.bottom - oldBounds.top;

            // Предотвращаем деление на ноль
            if (oldGameWidth > 0 && oldGameHeight > 0) {
                // Находим относительное положение в старых границах (0.0 до 1.0)
                const relativeX = (Game.player.x - oldBounds.left) / oldGameWidth;
                const relativeY = (Game.player.y - oldBounds.top) / oldGameHeight;

                // Применяем это положение к новым границам
                const newGameWidth = Game.bounds.right - Game.bounds.left;
                const newGameHeight = Game.bounds.bottom - Game.bounds.top;

                Game.player.x = Game.bounds.left + (relativeX * newGameWidth);
                Game.player.y = Game.bounds.top + (relativeY * newGameHeight);
            }
        }

        if (typeof handleEnemyResize === 'function') {
            handleEnemyResize();
        }
    }
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

    if (lastTime === 0) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000; // в секундах
    lastTime = currentTime;

    // 2. Анимация звезд работает.
    if (Game.canvas) {
        updateStars();
    }

    if (hasStartedMoving) { // Враги существуют только после начала движения
        if (typeof updateEnemies === 'function') {
            updateEnemies(deltaTime);
        }
        if (typeof renderEnemies === 'function') {
            renderEnemies();
        }
    }
    
    // 3. Основная игровая логика работает только если игра не в процессе выхода.
    if (!Game.isShuttingDown) {
        
        // Логика сценария и появления игрока
        if (Game.player.isFlyingIn) {
            updatePlayerFlyIn(currentTime);
        }
        
        // Логика управления и состояния игрока
        if (Game.isActive) {
            updatePlayerPosition();
            if (typeof checkCollisions === 'function') {
                checkCollisions();
            }
        }

        if (Game.player.isInvincible) {
            Game.player.invincibilityTimer -= deltaTime;
            if (Game.player.invincibilityTimer <= 0) {
                Game.player.isInvincible = false;
                Game.player.invincibilityTimer = 0;
                Game.player.el?.classList.remove('is-invincible');
                console.log("Player is no longer invincible.");
            }
        }
        
        // Логика геймплея (потеря HP, и т.д.)
        if (hasStartedMoving) {
            const oldHp = Game.hp;
            if (Game.phase === 'level') {
                const hpLossPerSecond = 2; // Пример
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
    // 1. Все проверки (на запуск, на размер)
    if (document.body.classList.contains('game-mode') || Game.isShuttingDown) {
        return false;
    }

    if (window.getSelection) {
        const selection = window.getSelection();
        // Проверяем, есть ли что сбрасывать
        if (selection.rangeCount > 0) {
            selection.removeAllRanges();
        }
    }

    updateLayout();
    if (window.innerWidth < Game.settings.MIN_WINDOW_WIDTH || window.innerHeight < Game.settings.MIN_WINDOW_HEIGHT) {
        if (typeof window.triggerQteSystemError === 'function') {
            const msg = `ТРЕБУЕТСЯ ОКНО ${Game.settings.MIN_WINDOW_WIDTH}x${Game.settings.MIN_WINDOW_HEIGHT}`;
            window.triggerQteSystemError(msg);
        }
        return false;
    }

    console.log("Game mode INITIALIZED.");

    resetGameState();
    if (!isGameLoopActive) {
        isGameLoopActive = true;
        requestAnimationFrame(gameLoop);
    }
    initStarsCanvas(); 
    createPlayer(); 
    createStartPrompt(); 
    createGameUI(); 
    const cursorBlocker = document.createElement('div');
    cursorBlocker.id = 'game-cursor-blocker';
    document.body.appendChild(cursorBlocker);
    window.addEventListener('mousemove', showCursor);
    window.addEventListener('resize', updateLayout);
    hideCursor();

    // --- НАЧАЛО ПОСЛЕДОВАТЕЛЬНОСТИ АНИМАЦИЙ ---

    // ЭТАП 1: Исчезает UI сайта (Длительность: 500ms)
    document.body.classList.add('site-ui-hidden');

    const siteFadeOutDuration = 500
    const lineMoveDuration = 500; // Длительность анимации линий из CSS

    // ЭТАП 2: Сдвигаются линии (Начинается после Этапа 1)
    setTimeout(() => {
        console.log("Step 2: Moving guide lines.");
        // Добавляем классы, которые запускают transition для линий
        document.body.classList.add('game-mode');
        // document.body.classList.add('game-active'); // <-- УДАЛИТЕ ЭТУ СТРОКУ
    }, siteFadeOutDuration);

    const disableTransitionsDelay = siteFadeOutDuration + lineMoveDuration;
    setTimeout(() => {
        document.body.classList.add('no-line-transitions');
    }, disableTransitionsDelay);

    // ЭТАП 3: Появляются игровые элементы (Начинается после Этапа 2)
    const gameElementsAppearDelay = siteFadeOutDuration + lineMoveDuration;
    setTimeout(() => {
        console.log("Step 3: Spawning game elements.");
        document.getElementById('stars-canvas')?.classList.add('visible');
        startPlayerFlyIn(); // Анимация вылета корабля
        document.querySelector('.game-start-prompt')?.classList.add('visible');
    }, gameElementsAppearDelay);
    const playerFlyInDuration = 800; // Длительность анимации вылета корабля

    // ВКЛЮЧЕНИЕ УПРАВЛЕНИЯ: Происходит после ВСЕХ визуальных этапов
    const timeUntilReady = gameElementsAppearDelay + playerFlyInDuration;
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

    const playerShip = document.getElementById('player-ship');
    if (playerShip) {
        // Немедленно добавляем класс, который отключает все анимации.
        playerShip.classList.add('is-exiting');
    }

    document.body.classList.remove('no-line-transitions');
    
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
        // document.body.classList.remove('game-active'); // <-- УДАЛИТЕ И ЭТУ
    }, lineReturnDelay);

    // 6. Показываем UI сайта после завершения анимации линий
    const lineAnimationDuration = 500;
    const siteAppearDelay = lineReturnDelay + lineAnimationDuration;
    setTimeout(() => {
        // *** НОВОЕ: Добавляем временный класс для синхронизации анимации появления ***
        document.body.classList.add('is-revealing');
        document.body.classList.remove('site-ui-hidden');
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
        showCursor();
        destroyGameUI();

        if (typeof window.resetQTE === 'function') {
            window.resetQTE();
        }
        
        // Очищаем CSS-переменные
        const root = document.documentElement;
        const propertiesToRemove = ['--game-border-top', '--game-border-bottom', '--game-border-left', '--game-border-right'];
        propertiesToRemove.forEach(prop => root.style.removeProperty(prop));
        
        document.body.classList.remove('is-revealing');
        
        resetGameState(); 
        isGameLoopActive = false;

    }, cleanupDelay);
}

window.initGame = initGame;