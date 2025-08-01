// assets/js/game/core/state.js

const Game = {
    isActive: false,
    isReady: false,
    player: {
        el: null, x: 0, y: 0,
        isFlyingIn: false,
        flyIn: { startY: 0, targetY: 0, duration: 800, startTime: 0 }
    },
    stars: [],
    settings: {}, // !!! ПУСТОЙ ОБЪЕКТ !!!
    bounds: {},
    canvas: null,
    ctx: null
};