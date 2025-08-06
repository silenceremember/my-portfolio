// assets/js/game/config/levels.js

const LevelData = {
    1: {
        type: 'survival',
        transitionDuration: 8,
        levelDuration: 500,
        scenario: LEVEL_1_SCENARIO // <-- Ссылка на сценарий из level_1.js
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