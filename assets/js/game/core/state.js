// assets/js/game/core/state.js

const Game = {
    isActive: false,
    isReady: false,
    isReadyToPlay: false,
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
    stars: [],
    settings: {},
    bounds: {},
    canvas: null,
    ctx: null
};