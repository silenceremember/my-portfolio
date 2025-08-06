// assets/js/game/gameplay/scenario.js

/**
 * Запускает сценарий для текущего уровня: сначала исполняет начальные события,
 * затем переводит игру в состояние ожидания (фаза transition).
 */
function startScenario() {
    console.log(`%c--- Starting scenario for Level ${Game.currentLevel} ---`, "color: yellow; font-weight: bold;");

    // Сразу исполняем все события с time: 0 (создаем "промпт")
    executeInitialScenarioEvents();

    // Переводим игру в начальную фазу. Таймер пока стоит на нуле.
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
 * Движок сценария. Вызывается из gameLoop только ПОСЛЕ начала движения.
 * Управляет сменой фаз и исполнением событий.
 * @param {number} deltaTime - Время, прошедшее с прошлого кадра.
 */
function updateScenario(deltaTime) {
    // Эта функция теперь отвечает за ВСЮ логику времени и фаз
    Game.phaseTimer += deltaTime;

    const currentLevelData = LevelData[Game.currentLevel];
    if (!currentLevelData) return;

    // Логика для каждой фазы
    switch (Game.phase) {
        case 'transition':
            // Здесь можно добавить анимации для перехода
            if (Game.phaseTimer >= currentLevelData.transitionDuration) {
                startLevelPhase();
            }
            break;
        
        case 'level':
            const scenario = currentLevelData.scenario;
            // Исполняем события из сценария
            while (
                Game.scenario.nextEventIndex < scenario.length &&
                scenario[Game.scenario.nextEventIndex].time <= Game.phaseTimer
            ) {
                const event = scenario[Game.scenario.nextEventIndex];
                executeScenarioEvent(event);
                Game.scenario.nextEventIndex++;
            }

            // Проверяем условие завершения уровня
            if (currentLevelData.type === 'survival' && Game.phaseTimer >= currentLevelData.levelDuration) {
                endCurrentLevel();
            }
            break;
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
    Game.phaseTimer = 0; // Сбрасываем таймер для новой фазы
    // Любые визуальные эффекты для transition начинаются здесь
}

function startLevelPhase() {
    console.log("Phase changed to: LEVEL (HP drain is ON)");
    Game.phase = 'level';
    Game.phaseTimer = 0; // Сбрасываем таймер для новой фазы (очень важно!)
    
    // ВАЖНО: События с time: 0 уже были исполнены.
    // Таймер фазы level начинается с 0, и updateScenario продолжит с того места,
    // где остановился executeInitialScenarioEvents.
}