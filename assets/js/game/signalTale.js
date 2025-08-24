// assets/js/game/signalTale.js

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
let gameLoopId = null;
window.hasStartedMoving = false;
window.lastTime = 0;

/**
 * Обработчик нажатия клавиш в игре.
 * Логика выхода по ESC УДАЛЕНА, т.к. ей теперь управляет modeManager.
 */
function handleGameInput(e) {
    const action = keyMap[e.code]; 
    if (action !== undefined) {
        e.preventDefault(); 
        
        if (!hasStartedMoving) {
            console.log("First player movement detected. Starting game clock and logic.");
            hasStartedMoving = true;
            // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
            if (typeof window.hideModeCursor === 'function') {
                window.hideModeCursor(); // Используем глобальную функцию
            }
            // -------------------------
            showGameUI();
        }
        
        Game.controls[action] = true;
    }
    
    // Тестовый код
    if (e.code === 'KeyT') { if (Game.hp > 0) { const oldHp = Game.hp; Game.hp -= 20; if (Game.hp < 0) Game.hp = 0; shakeHpBar(); updateHpBar(oldHp); } }
    if (e.code === 'KeyY') { if (Game.hp < 100) { const oldHp = Game.hp; Game.hp += 20; if (Game.hp > 100) Game.hp = 100; updateHpBar(oldHp); } }
    if (e.code === 'KeyN' && Game.phase === 'level') { endCurrentLevel(); }
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

/**
 * Запускает срежиссированную последовательность анимации смерти игрока.
 */
function startPlayerDeathSequence() {
    if (Game.isPlayerDying || Game.isShuttingDown) return;
    console.log("%cGAME OVER - Starting final death sequence with pause...", "color: red; font-weight: bold;");

    Game.isPlayerDying = true;
    Game.isActive = false;

    const playerShip = Game.player.el;
    if (!playerShip) return;

    // Тайминги
    const FADE_WORLD_DURATION = 100;
    const SHAKE_DURATION = 1000;
    const PAUSE_BEFORE_SPLIT = 400;
    const DEATH_ANIM_DURATION = 500;

    // Последовательность
    document.querySelector('.game-ui-top')?.classList.remove('visible');
    document.querySelector('.game-ui-bottom')?.classList.remove('visible');
    document.getElementById('stars-canvas')?.classList.remove('visible');
    const damageOverlay = document.getElementById('damage-overlay');
    if (damageOverlay) damageOverlay.style.opacity = '0';
    if (typeof startEnemyFadeOut === 'function') startEnemyFadeOut();

    const shakeStartTime = FADE_WORLD_DURATION;
    setTimeout(() => playerShip.classList.add('is-dying'), shakeStartTime);

    const splitStartTime = shakeStartTime + SHAKE_DURATION + PAUSE_BEFORE_SPLIT;
    setTimeout(() => {
        playerShip.classList.remove('is-dying');
        playerShip.classList.add('is-splitting');
        playerShip.classList.remove('visible'); 
    }, splitStartTime);

    const exitTime = splitStartTime + DEATH_ANIM_DURATION + 100;
    setTimeout(() => {
        // Вызываем выход через modeManager
        if (window.actionHandler) {
             window.actionHandler.trigger(); // Повторный вызов триггера закроет режим
        }
    }, exitTime);
}

// ======================================================
/**
 * ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ
 */
function gameLoop(currentTime) {
    if (!isGameLoopActive) {
        console.log("Game loop has been terminated.");
        return;
    }

    if (lastTime === 0) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    const cappedDeltaTime = Math.min(deltaTime, 0.1);

    // ======================================================
    // === БЛОК 1: ОБНОВЛЕНИЕ СОСТОЯНИЯ (UPDATE LOGIC)    ===
    // ======================================================

    // --- Обновления, которые работают почти всегда ---
    updateStars(cappedDeltaTime);

    // Анимация вылета игрока работает до начала движения
    if (Game.player.isFlyingIn) {
        updatePlayerFlyIn(currentTime);
    }
    
    // --- Обновления, которые работают только после начала движения ---
    if (hasStartedMoving) {
        // Движение врагов
        updateEnemies(cappedDeltaTime);
        
        // Основная интерактивная логика (только если игра не в процессе выхода/смерти)
        if (!Game.isShuttingDown && !Game.isPlayerDying) {
            
            if (Game.isActive) {
                updatePlayerPosition();
                checkCollisions();
            }
            
            updateScenario(cappedDeltaTime);

            if (Game.phase === 'level') {
                Game.hp -= 2 * deltaTime;
            }

            if (Game.player.isInvincible) {
                Game.player.invincibilityTimer -= deltaTime;
                if (Game.player.invincibilityTimer <= 0) {
                    Game.player.isInvincible = false;
                    Game.player.invincibilityTimer = 0;
                    Game.player.el?.classList.remove('is-invincible');
                }
            }

            if (Game.hp <= 0) {
                Game.hp = 0;
                startPlayerDeathSequence();
            }
        }
    }
    
    // --- Логика движения врагов при выходе из игры (если движение еще не было начато) ---
    // Это редкий случай, но важный: если нажать ESC до начала движения
    if ((Game.isShuttingDown || Game.isPlayerDying) && !hasStartedMoving) {
         // Мы не вызываем updateEnemies, чтобы они стояли на месте
    }


    // ======================================================
    // === БЛОК 2: ОТРИСОВКА (RENDER)                     ===
    // ======================================================

    renderEnemies(); // Промпт виден всегда
    
    // Игрока отрисовываем всегда, пока он не в финальной стадии смерти (is-splitting)
    // Флаг isPlayerDying используется для логики, а для рендера лучше проверять классы
    if (Game.player.el && !Game.player.el.classList.contains('is-splitting')) {
         renderPlayer();
    }
    
    if (hasStartedMoving && !Game.isShuttingDown && !Game.isPlayerDying) {
        updateHpBar(Game.hp);
        updateLevelIndicators();
    }

    gameLoopId = requestAnimationFrame(gameLoop)
}

/**
 * Вызывается при входе в режим игры. Создает все игровые объекты.
 */
function prepareSignalTale() {
    console.log("Preparing Signal Tale elements...");
    resetGameState();
    if (!isGameLoopActive) {
        isGameLoopActive = true;
        requestAnimationFrame(gameLoop);
    }
    initStarsCanvas(); 
    createPlayer(); 
    createGameUI();
    
    const damageOverlay = document.createElement('div');
    damageOverlay.id = 'damage-overlay';
    document.body.appendChild(damageOverlay);
}

function activateSignalTale() {
    return new Promise(resolve => {
        console.log("Activating Signal Tale visuals...");
        
        document.getElementById('stars-canvas')?.classList.add('visible');
        startPlayerFlyIn();
        if (typeof startScenario === 'function') {
            startScenario();
        }
        
        const playerFlyInDuration = 800;
        setTimeout(() => {
            console.log("Game is ready. Player can move now.");
            Game.isActive = true;
            window.addEventListener('keydown', handleGameInput);
            window.addEventListener('keyup', handleKeyUp);
            resolve(); // <--- СИГНАЛ О ПОЛНОМ ЗАВЕРШЕНИИ
        }, playerFlyInDuration);
    });
}

/**
 * Вызывается при начале выхода из режима. Запускает анимации исчезновения.
 */
function teardownSignalTale() {
    console.log("Tearing down Signal Tale visuals...");

    Game.isShuttingDown = true; 

    // Отключаем ИГРОВЫЕ слушатели
    window.removeEventListener('keydown', handleGameInput);
    window.removeEventListener('keyup', handleKeyUp);
    
    // Запускаем анимации исчезновения
    document.getElementById('stars-canvas')?.classList.remove('visible');
    document.querySelector('.game-ui-top')?.classList.remove('visible');
    document.querySelector('.game-ui-bottom')?.classList.remove('visible');
    document.getElementById('damage-overlay')?.classList.remove('visible');
    document.getElementById('player-ship')?.classList.remove('visible');

    if (typeof startEnemyFadeOut === 'function') {
        startEnemyFadeOut();
    }
}

/**
 * Вызывается после полного выхода из режима. Удаляет DOM-элементы и сбрасывает состояние.
 */
function cleanupSignalTale() {
    console.log("Cleaning up Signal Tale state...");

    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    
    isGameLoopActive = false;

    // Удаляем все созданные ИГРОВЫЕ DOM-элементы
    document.getElementById('player-ship')?.remove();
    document.getElementById('stars-canvas')?.remove();
    document.querySelectorAll('.game-entity').forEach(el => el.remove());
    destroyGameUI();
    document.getElementById('damage-overlay')?.remove();
    
    if (typeof window.resetQTE === 'function') {
        window.resetQTE();
    }
    
    // Сбрасываем все игровые переменные
    resetGameState(); 
}

/**
 * Обработчик изменения размера окна, специфичный для Signal Tale.
 * Вызывается из modeManager.
 */
window.signalTaleResizeHandler = function() {
    // Эта функция пересчитывает позиции игрока и врагов при ресайзе.
    // Логика скопирована из старой функции updateLayout.
    const oldBounds = { ...Game.bounds };

    const newOffsetX = (window.innerWidth - Game.settings.GAME_WIDTH) / 2;
    const newOffsetY = (window.innerHeight - Game.settings.GAME_HEIGHT) / 2;
    Game.bounds = {
        top: newOffsetY,
        bottom: newOffsetY + Game.settings.GAME_HEIGHT,
        left: newOffsetX,
        right: newOffsetX + Game.settings.GAME_WIDTH
    };

    if (Game.player.el && oldBounds.left !== undefined) {
        if (Game.player.isFlyingIn) {
            Game.player.x = Game.bounds.left + (Game.settings.GAME_WIDTH / 2);
            Game.player.flyIn.targetY = Game.bounds.bottom - Game.settings.PLAYER_HEIGHT - 20;
        } else {
            const oldGameWidth = oldBounds.right - oldBounds.left;
            const oldGameHeight = oldBounds.bottom - oldBounds.top;
            if (oldGameWidth > 0 && oldGameHeight > 0) {
                const relativeX = (Game.player.x - oldBounds.left) / oldGameWidth;
                const relativeY = (Game.player.y - oldBounds.top) / oldGameHeight;
                const newGameWidth = Game.bounds.right - Game.bounds.left;
                const newGameHeight = Game.bounds.bottom - Game.bounds.top;
                Game.player.x = Game.bounds.left + (relativeX * newGameWidth);
                Game.player.y = Game.bounds.top + (relativeY * newGameHeight);
            }
        }
        if (Game.enemies && Game.enemies.length > 0 && oldBounds.left !== undefined) {
            if (typeof handleEnemyResize === 'function') {
                handleEnemyResize(oldBounds);
            }
        }
    }
}