// assets/js/game/scenarios/level_1.js

/**
 * Сценарий для Уровня 1.
 * Описывает все события на временной шкале уровня.
 * Позиции указаны в относительных координатах (от 0.0 до 1.0) относительно игровой зоны.
 * Движок сценариев сам преобразует их в пиксели и центрирует объекты.
 */

// --- Константы для размеров, чтобы сохранить пропорции ---
const KEY_SIZE = 32;
const TITLE_HEIGHT = 42;
const ESC_WIDTH = 72;
const ESC_HEIGHT = 34;
const CONTROL_SECTION_WIDTH = 273;

const LEVEL_1_SCENARIO = [
    // === СОБЫТИЯ НА 0 СЕКУНДЕ: Создание "промпта" ===

    // --- Секция "УПРАВЛЕНИЕ" ---
    {
        time: 0,
        type: 'spawn',
        config: {
            blueprint: 'BASE_THREAT',
            position: { x: 0.5, y: 0.26 },
            size: { width: CONTROL_SECTION_WIDTH, height: TITLE_HEIGHT },
            visual: { content: 'УПРАВЛЕНИЕ', classList: ['prompt-title'] }
        }
    },

    // --- Клавиши WASD (левая группа, сдвинута еще левее) ---
    {
        time: 0,
        type: 'spawn',
        config: {
            blueprint: 'BASE_THREAT',
            position: { x: 0.33, y: 0.35 },
            size: { width: KEY_SIZE, height: KEY_SIZE },
            visual: { content: GameIcons.keyW, classList: ['prompt-key'] }
        }
    },
    {
        time: 0,
        type: 'spawn',
        config: {
            blueprint: 'BASE_THREAT',
            position: { x: 0.26, y: 0.42 },
            size: { width: KEY_SIZE, height: KEY_SIZE },
            visual: { content: GameIcons.keyA, classList: ['prompt-key'] }
        }
    },
    {
        time: 0,
        type: 'spawn',
        config: {
            blueprint: 'BASE_THREAT',
            position: { x: 0.33, y: 0.42 },
            size: { width: KEY_SIZE, height: KEY_SIZE },
            visual: { content: GameIcons.keyS, classList: ['prompt-key'] }
        }
    },
    {
        time: 0,
        type: 'spawn',
        config: {
            blueprint: 'BASE_THREAT',
            position: { x: 0.40, y: 0.42 },
            size: { width: KEY_SIZE, height: KEY_SIZE },
            visual: { content: GameIcons.keyD, classList: ['prompt-key'] }
        }
    },

    // --- Клавиши-стрелки (правая группа, сдвинута еще правее) ---
    {
        time: 0,
        type: 'spawn',
        config: {
            blueprint: 'BASE_THREAT',
            position: { x: 0.67, y: 0.35 },
            size: { width: KEY_SIZE, height: KEY_SIZE },
            visual: { content: GameIcons.arrowUp, classList: ['prompt-key'] }
        }
    },
    {
        time: 0,
        type: 'spawn',
        config: {
            blueprint: 'BASE_THREAT',
            position: { x: 0.60, y: 0.42 },
            size: { width: KEY_SIZE, height: KEY_SIZE },
            visual: { content: GameIcons.arrowLeft, classList: ['prompt-key'] }
        }
    },
    {
        time: 0,
        type: 'spawn',
        config: {
            blueprint: 'BASE_THREAT',
            position: { x: 0.67, y: 0.42 },
            size: { width: KEY_SIZE, height: KEY_SIZE },
            visual: { content: GameIcons.arrowDown, classList: ['prompt-key'] }
        }
    },
    {
        time: 0,
        type: 'spawn',
        config: {
            blueprint: 'BASE_THREAT',
            position: { x: 0.74, y: 0.42 },
            size: { width: KEY_SIZE, height: KEY_SIZE },
            visual: { content: GameIcons.arrowRight, classList: ['prompt-key'] }
        }
    },
    
    // --- Секция "ВЫХОД" ---
    {
        time: 0,
        type: 'spawn',
        config: {
            blueprint: 'BASE_THREAT',
            position: { x: 0.5, y: 0.60 },
            size: { width: CONTROL_SECTION_WIDTH, height: TITLE_HEIGHT },
            visual: { content: 'ВЫХОД', classList: ['prompt-title'] }
        }
    },
    {
        time: 0,
        type: 'spawn',
        config: {
            blueprint: 'BASE_THREAT',
            position: { x: 0.5, y: 0.69 },
            size: { width: ESC_WIDTH, height: ESC_HEIGHT },
            visual: { content: 'ESC', classList: ['prompt-key', 'key-esc'] }
        }
    },
];