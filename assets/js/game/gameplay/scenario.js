// assets/js/game/gameplay/scenario.js

/**
 * Запускает сценарий для текущего уровня: сначала исполняет начальные события,
 * затем переводит игру в состояние ожидания (фаза transition).
 */
function startScenario() {
    console.log(`%c--- Starting scenario for Level ${Game.currentLevel} ---`, "color: yellow; font-weight: bold;");

    // Сбрасываем таймер и указатель события для НОВОГО уровня
    Game.phaseTimer = 0;
    Game.scenario.nextEventIndex = 0;

    // Исполняем события с time: 0
    executeInitialScenarioEvents();

    // Переводим игру в начальную фазу
    startTransitionPhase();
}

/**
 * Исполняет все "начальные" события (с time: 0) из сценария текущего уровня.
 */
function executeInitialScenarioEvents() {
    const levelData = LevelData[Game.currentLevel];
    const scenario = levelData ? levelData.scenario : [];
    if (!scenario || scenario.length === 0) return;

    console.log("Executing initial (time: 0) scenario events...");
    
    // Сбрасываем указатель на случай, если это запуск нового уровня
    Game.scenario.nextEventIndex = 0;

    while (
        Game.scenario.nextEventIndex < scenario.length &&
        scenario[Game.scenario.nextEventIndex].time === 0
    ) {
        const event = scenario[Game.scenario.nextEventIndex];
        executeScenarioEvent(event);
        Game.scenario.nextEventIndex++;
    }
}


/**
 * Движок сценария. Теперь он работает в обеих фазах (transition и level)
 * и использует единый сквозной таймер для всего уровня.
 * @param {number} deltaTime - Время, прошедшее с прошлого кадра.
 */
function updateScenario(deltaTime) {
    // Движок работает, только если игрок начал движение
    if (!hasStartedMoving) return;

    // ЕДИНЫЙ таймер для всего уровня.
    Game.phaseTimer += deltaTime;

    const currentLevelData = LevelData[Game.currentLevel];
    if (!currentLevelData) return;

    // --- 1. Логика смены фаз (основана на едином таймере) ---
    if (Game.phase === 'transition' && Game.phaseTimer >= currentLevelData.transitionDuration) {
        startLevelPhase(); // Эта функция просто меняет флаг, не сбрасывая таймер
    }

    // --- 2. Логика исполнения событий сценария (работает всегда) ---
    const scenario = currentLevelData.scenario;
    if (!scenario) return;

    // Проверяем события по единому таймеру
    while (
        Game.scenario.nextEventIndex < scenario.length &&
        scenario[Game.scenario.nextEventIndex].time <= Game.phaseTimer
    ) {
        const event = scenario[Game.scenario.nextEventIndex];
        executeScenarioEvent(event);
        Game.scenario.nextEventIndex++;
    }

    // --- 3. Проверка на завершение уровня ---
    if (currentLevelData.type === 'survival' && Game.phaseTimer >= (currentLevelData.transitionDuration + currentLevelData.levelDuration)) {
        endCurrentLevel();
    }
}


/**
 * Диспетчер событий. (Код без изменений)
 */
function executeScenarioEvent(event) {
    console.log(`Executing event: ${event.type} at time ${event.time.toFixed(2)}s`);
    
    switch (event.type) {
        case 'spawn':
            if (typeof spawnEntity === 'function') {
                // --- ИСПРАВЛЕНИЕ: Создаем глубокую копию конфига, чтобы не мутировать оригинал ---
                const spawnConfig = JSON.parse(JSON.stringify(event.config));
                
                // Преобразуем относительные координаты в абсолютные
                const gameWidth = Game.bounds.right - Game.bounds.left;
                const gameHeight = Game.bounds.bottom - Game.bounds.top;

                const relativeX = spawnConfig.position.x;
                const relativeY = spawnConfig.position.y;

                const absoluteX = Game.bounds.left + relativeX * gameWidth;
                const absoluteY = Game.bounds.top + relativeY * gameHeight;
                
                // Центрируем объект относительно его точки спауна
                spawnConfig.position.x = absoluteX - (spawnConfig.size.width / 2);
                spawnConfig.position.y = absoluteY - (spawnConfig.size.height / 2);

                // Вызываем спаунер с уже готовыми, абсолютными координатами
                spawnEntity(spawnConfig);
                // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
            }
            break;
    }
}

/**
 * Принудительно завершает текущий уровень.
 */
function endCurrentLevel() {
    console.log(`%c--- Level ${Game.currentLevel} completed! ---`, "color: green; font-weight: bold;");
    
    // Удаляем всех оставшихся врагов перед переходом
    Game.enemies.forEach(e => e.el?.remove());
    Game.enemies = [];

    Game.currentLevel++;
    if (LevelData[Game.currentLevel]) {
        startScenario(); // Запускаем следующий уровень
    } else {
        console.log("%c>>> ALL LEVELS COMPLETED! (VICTORY) <<<", "color: cyan; font-size: 1.5em;");
        Game.isActive = false; // Или запускаем финальную катсцену
    }
}

// --- Функции для смены фаз ---

function startTransitionPhase() {
    console.log("Phase changed to: TRANSITION");
    Game.phase = 'transition';
    // Таймер больше не сбрасывается здесь. Он сбрасывается только в самом начале уровня.
}

function startLevelPhase() {
    console.log("Phase changed to: LEVEL (HP drain is ON)");
    Game.phase = 'level';
    // Таймер НЕ сбрасывается. Он продолжает тикать.
}