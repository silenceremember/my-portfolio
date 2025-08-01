/**
 * Запускает сценарий для текущего уровня.
 * Обычно вызывается в начале игры или после завершения предыдущего уровня.
 */
function startScenario() {
    console.log(`Starting scenario for Level ${Game.currentLevel}`);
    Game.phaseTimer = 0;
    // Каждый уровень начинается с фазы перехода
    startTransitionPhase();
}

/**
 * Обновляет логику сценария на каждом кадре.
 * @param {number} deltaTime - Время, прошедшее с прошлого кадра (в секундах).
 */
function updateScenario(deltaTime) {
    if (!Game.isActive) return;

    Game.phaseTimer += deltaTime;

    const currentLevelData = LevelData[Game.currentLevel];
    if (!currentLevelData) return;

    // Проверяем, не пора ли сменить фазу
    switch (Game.phase) {
        case 'transition':
            if (Game.phaseTimer >= currentLevelData.transitionDuration) {
                startLevelPhase();
            }
            break;
        
        case 'level':
            // ИСПРАВЛЕНИЕ: Завершаем уровень по таймеру ТОЛЬКО если это 'survival'
            if (currentLevelData.type === 'survival' && Game.phaseTimer >= currentLevelData.levelDuration) {
                endCurrentLevel(); // Вызываем новую функцию для завершения
            }
            // Для уровней типа 'boss' этот блок никогда не выполнится по таймеру.
            break;
    }
}

function endCurrentLevel() {
    console.log(`Level ${Game.currentLevel} completed!`);
    Game.currentLevel++;
    
    if (LevelData[Game.currentLevel]) {
        startScenario(); // Начинаем сценарий следующего уровня
    } else {
        console.log("ALL LEVELS COMPLETED! (VICTORY)");
        Game.isActive = false; // Останавливаем игру
    }
}

// --- Функции для смены фаз ---

function startTransitionPhase() {
    console.log("Phase changed to: TRANSITION");
    Game.phase = 'transition';
    Game.phaseTimer = 0;
    // Здесь в будущем будет код для анимации "УРОВЕНЬ 1"
}

function startLevelPhase() {
    console.log("Phase changed to: LEVEL (HP drain is ON)");
    Game.phase = 'level';
    Game.phaseTimer = 0;
    // Здесь в будущем будет код для спавна врагов
}