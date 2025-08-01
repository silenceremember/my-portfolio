// assets/js/game/core/state.js

const Game = {
    isActive: false,
    isReadyToPlay: false,
    isShuttingDown: false, // Добавляем этот флаг для надежности

    hp: 100, // Health Points (0-100)
    currentLevel: 1,

    player: {
        el: null, x: 0, y: 0,
        isFlyingIn: false,
        flyIn: { startY: 0, targetY: 0, duration: 800, startTime: 0 }
    },
    // НОВАЯ СТРУКТУРА: отслеживаем не клавиши, а НАПРАВЛЕНИЯ
    controls: {
        up: false,
        down: false,
        left: false,
        right: false
    },

    ui: {
        hpBarSegments: [], // Было hpBar: null
        levelDots: []
    },

    stars: [],
    settings: {},
    bounds: {},
    canvas: null,
    ctx: null
};

function resetGameState() {
    Game.isActive = false;
    Game.isReadyToPlay = false;
    Game.isShuttingDown = false;
    
    Game.hp = 100;
    Game.currentLevel = 1;

    // Сбрасываем управление
    Object.keys(Game.controls).forEach(action => Game.controls[action] = false);

    // Очищаем ссылки на UI элементы, чтобы они пересоздавались
    Game.ui.hpBarSegments = [];
    Game.ui.levelDots = [];
    
    console.log("Game state has been reset.");
}