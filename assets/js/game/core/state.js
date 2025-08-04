// assets/js/game/core/state.js

const Game = {
    // --- Флаги состояния ---
    isActive: false,
    isShuttingDown: false, // <-- ВОЗВРАЩАЕМ ЭТОТ ФЛАГ

    // --- Игровые переменные ---
    hp: 100,
    currentLevel: 1,
    phase: 'none',
    phaseTimer: 0,

    // --- Объекты игры ---
    player: {
        el: null, x: 0, y: 0,
        isFlyingIn: false,
        flyIn: { startY: 0, targetY: 0, duration: 800, startTime: 0 },
        // --- НОВЫЕ СВОЙСТВА ---
        isInvincible: false,
        invincibilityTimer: 0,
        invincibilityDuration: 3 // Длительность в секундах
    },
    enemies: [],
    controls: {
        up: false,
        down: false,
        left: false,
        right: false
    },
    ui: {
        hpBarSegments: [],
        levelDots: []
    },

    // --- Технические объекты ---
    stars: [],
    settings: {},
    bounds: {},
    canvas: null,
    ctx: null
};

/**
 * Сбрасывает все игровые переменные в начальное состояние.
 */
function resetGameState() {
    Game.isActive = false;
    Game.isShuttingDown = false; // <-- ВОЗВРАЩАЕМ СБРОС ФЛАГА
    
    Game.hp = 100;
    Game.currentLevel = 1;
    Game.phase = 'none';
    Game.phaseTimer = 0;

    Game.player.isInvincible = false;
    Game.player.invincibilityTimer = 0;

    Game.enemies = [];

    Object.keys(Game.controls).forEach(action => Game.controls[action] = false);

    Game.ui.hpBarSegments = [];
    Game.ui.levelDots = [];

    window.hasStartedMoving = false;
    window.lastTime = 0;

    if (typeof isGameLoopActive !== 'undefined') {
        isGameLoopActive = false;
    }
    
    console.log("Game state has been reset.");
}