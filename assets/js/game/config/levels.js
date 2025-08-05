// assets/js/game/config/levels.js

const LevelData = {
    1: {
        type: 'survival', // 'survival' - обычный уровень на время
        transitionDuration: 8,
        levelDuration: 52
    },
    2: {
        type: 'boss', // 'boss' - уровень с боссом
        transitionDuration: 8,
        // levelDuration можно убрать, но лучше оставить для справки или будущих механик
        levelDuration: Infinity // Явный признак бесконечности
    },
    3: {
        type: 'boss',
        transitionDuration: 8,
        levelDuration: Infinity
    },
    4: {
        type: 'boss',
        transitionDuration: 8,
        levelDuration: Infinity
    },
    5: {
        type: 'boss',
        transitionDuration: 8,
        levelDuration: Infinity
    }
};