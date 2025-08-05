// assets/js/game/gameplay/scenario.js

/**
 * Запускает сценарий для текущего уровня.
 * Обычно вызывается в начале игры или после завершения предыдущего уровня.
 */
function startScenario() {
    console.log(`%c--- Starting scenario for Level ${Game.currentLevel} ---`, "color: yellow; font-weight: bold;");
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

    switch (Game.phase) {
        case 'transition':
            if (Game.phaseTimer >= currentLevelData.transitionDuration) {
                startLevelPhase();
            }
            break;
        
        case 'level':
            if (currentLevelData.type === 'survival' && Game.phaseTimer >= currentLevelData.levelDuration) {
                endCurrentLevel();
            }
            break;
    }
}

/**
 * Принудительно завершает текущий уровень и переходит к следующему.
 */
function endCurrentLevel() {
    console.log(`%c--- Level ${Game.currentLevel} completed! ---`, "color: green; font-weight: bold;");
    Game.currentLevel++;
    
    if (LevelData[Game.currentLevel]) {
        startScenario(); // Начинаем сценарий следующего уровня
    } else {
        console.log("%c>>> ALL LEVELS COMPLETED! (VICTORY) <<<", "color: cyan; font-size: 1.5em;");
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
}