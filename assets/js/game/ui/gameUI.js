// assets/js/ui/gameUI.js

/**
 * Создает все DOM-элементы для игрового интерфейса (HUD).
 */
function createGameUI() {
    // --- Создание верхнего UI (HP) - без изменений ---
    const topUI = document.createElement('div');
    topUI.className = 'game-ui-top';
    const hpBarContainer = document.createElement('div');
    hpBarContainer.id = 'hp-bar-container';
    
    if (!Game.ui.hpBarSegments) Game.ui.hpBarSegments = [];
    // Очищаем на случай повторного вызова (хотя не должно быть)
    Game.ui.hpBarSegments = []; 

    for (let i = 0; i < 5; i++) { // HP всегда из 5 сегментов (100 / 20)
        const segmentFill = document.createElement('div');
        segmentFill.className = 'hp-segment-fill';
        hpBarContainer.appendChild(segmentFill);
        Game.ui.hpBarSegments.push(segmentFill);
    }
    
    topUI.appendChild(hpBarContainer);
    document.body.appendChild(topUI);

    // --- ИЗМЕНЕНИЕ: Создание нижнего UI (Уровни) ---
    const bottomUI = document.createElement('div');
    bottomUI.className = 'game-ui-bottom';
    const levelIndicators = document.createElement('div');
    levelIndicators.id = 'level-indicators';
    
    if (!Game.ui.levelDots) Game.ui.levelDots = [];
    // Очищаем массив перед заполнением
    Game.ui.levelDots = []; 

    // Получаем реальное количество уровней из LevelData
    const totalLevels = Object.keys(LevelData).length;
    console.log(`Creating level indicators for ${totalLevels} levels.`);

    // Создаем столько точек, сколько у нас уровней
    for (let i = 0; i < totalLevels; i++) {
        const dot = document.createElement('div');
        dot.className = 'level-dot';
        levelIndicators.appendChild(dot);
        Game.ui.levelDots.push(dot);
    }

    bottomUI.appendChild(levelIndicators);
    document.body.appendChild(bottomUI);
}

function showGameUI() {
    const topUI = document.querySelector('.game-ui-top');
    const bottomUI = document.querySelector('.game-ui-bottom');
    if (topUI) topUI.classList.add('visible');
    if (bottomUI) bottomUI.classList.add('visible');
}

function shakeHpBar() {
    const hpBarContainer = document.getElementById('hp-bar-container');
    if (!hpBarContainer) return;

    if (hpBarContainer.classList.contains('shake-animation')) {
        return;
    }

    hpBarContainer.classList.add('shake-animation');
    setTimeout(() => {
        hpBarContainer.classList.remove('shake-animation');
    }, 400);
}

function pulseHpSegment(segmentIndex) {
    if (!Game.ui.hpBarSegments || !Game.ui.hpBarSegments[segmentIndex]) return;
    const segmentFill = Game.ui.hpBarSegments[segmentIndex];

    if (segmentFill.classList.contains('pulse-animation')) {
        return;
    }

    segmentFill.classList.add('pulse-animation');
    setTimeout(() => {
        segmentFill.classList.remove('pulse-animation');
    }, 300);
}

/**
 * Обновляет визуальное состояние шкалы HP.
 * (ЕДИНСТВЕННАЯ И ПРАВИЛЬНАЯ ВЕРСИЯ)
 * @param {number} oldHp - Значение HP до изменения.
 */
function updateHpBar(oldHp = Game.hp) {
    if (!Game.ui.hpBarSegments || Game.ui.hpBarSegments.length === 0) return;

    const newHp = Game.hp;
    const segments = Game.ui.hpBarSegments;
    const totalSegments = segments.length;

    // --- Шаг 1: Обновление заполнения ---
    const fullSegments = Math.floor(newHp / 20);
    const lastSegmentFill = (newHp % 20) / 20;

    for (let i = 0; i < totalSegments; i++) {
        segments[i].classList.remove('is-blinking');
        if (i < fullSegments) {
            segments[i].style.transform = 'scaleX(1)';
        } else if (i === fullSegments) {
            if (lastSegmentFill === 0 && newHp !== 100) {
                 segments[i].style.transform = 'scaleX(0)';
            } else {
                 segments[i].style.transform = `scaleX(${lastSegmentFill})`;
            }
        } else {
            segments[i].style.transform = 'scaleX(0)';
        }
    }
    
    // --- Шаг 2: Логика мерцания ---
    if (newHp > 0 && newHp <= 20) {
        if (segments[0]) segments[0].classList.add('is-blinking');
    }

    // --- Шаг 3: Анимация восстановления (ИСПРАВЛЕННАЯ ЛОГИКА) ---
    if (newHp > oldHp) {
        // Определяем, сколько полных сегментов было ДО восстановления
        const oldFullSegments = Math.floor(oldHp / 20);
        // Определяем, сколько полных сегментов стало ПОСЛЕ
        const newFullSegments = Math.floor(newHp / 20);

        // Если количество полных сегментов увеличилось,
        // значит, мы только что заполнили один из них.
        if (newFullSegments > oldFullSegments) {
            // Анимируем последний из НОВЫХ полных сегментов.
            // Его индекс будет newFullSegments - 1.
            const segmentToPulse = newFullSegments - 1;
            pulseHpSegment(segmentToPulse);
        }
    }
}


function updateLevelIndicators() {
    if (Game.ui.levelDots.length === 0) return;
    const levelIndex = Game.currentLevel - 1;
    Game.ui.levelDots.forEach((dot, index) => {
        dot.classList.remove('current', 'completed');
        if (index < levelIndex) {
            dot.classList.add('completed');
        } else if (index === levelIndex) {
            dot.classList.add('current');
        }
    });
}

function destroyGameUI() {
    document.querySelector('.game-ui-top')?.remove();
    document.querySelector('.game-ui-bottom')?.remove();
}