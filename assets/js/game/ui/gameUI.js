/**
 * Создает все DOM-элементы для игрового интерфейса (HUD).
 */
function createGameUI() {
    // --- Создание верхнего UI (Топливо) ---
    const topUI = document.createElement('div');
    topUI.className = 'game-ui-top';
    
    // 1. Создаем главный контейнер-обертку
    const hpBarWrapper = document.createElement('div');
    hpBarWrapper.id = 'hp-bar-wrapper';

    // 2. Создаем фоновый слой с пустыми сегментами
    const backgroundLayer = document.createElement('div');
    backgroundLayer.className = 'hp-bar-background';
    for (let i = 0; i < 5; i++) {
        const emptySegment = document.createElement('div');
        emptySegment.className = 'hp-segment hp-segment-empty';
        backgroundLayer.appendChild(emptySegment);
    }

    // 3. Создаем слой уровня топлива с заполненными сегментами
    const levelLayer = document.createElement('div');
    levelLayer.id = 'hp-bar-level'; // JS будет управлять этим элементом
    for (let i = 0; i < 5; i++) {
        const filledSegment = document.createElement('div');
        filledSegment.className = 'hp-segment hp-segment-filled';
        levelLayer.appendChild(filledSegment);
    }

    // 4. Собираем структуру: level поверх background, и все это в wrapper
    hpBarWrapper.appendChild(backgroundLayer);
    hpBarWrapper.appendChild(levelLayer);
    topUI.appendChild(hpBarWrapper);
    
    document.body.appendChild(topUI);
    // Сохраняем ссылку на элемент, которым будем управлять
    Game.ui.hpBar = levelLayer;

    // --- Создание нижнего UI (Уровни) ---
    const bottomUI = document.createElement('div');
    bottomUI.className = 'game-ui-bottom';
    const levelIndicators = document.createElement('div');
    levelIndicators.id = 'level-indicators';
    
    for (let i = 0; i < 5; i++) {
        const dot = document.createElement('div');
        dot.className = 'level-dot';
        levelIndicators.appendChild(dot);
        Game.ui.levelDots.push(dot);
    }

    bottomUI.appendChild(levelIndicators);
    document.body.appendChild(bottomUI);
}

/**
 * Делает элементы игрового интерфейса видимыми.
 */
function showGameUI() {
    const topUI = document.querySelector('.game-ui-top');
    const bottomUI = document.querySelector('.game-ui-bottom');
    if (topUI) topUI.classList.add('visible');
    if (bottomUI) bottomUI.classList.add('visible');
}

/**
 * Обновляет визуальное состояние топливной шкалы.
 */
function updateHpBar() {
    if (!Game.ui.hpBar) return;
    
    const percentage = Game.hp;
    
    Game.ui.hpBar.style.transform = `scaleX(${percentage / 100})`;
    
    // Порог мерцания теперь 20% (одна ячейка)
    if (percentage > 0 && percentage <= 20) {
        Game.ui.hpBar.classList.add('blinking');
    } else {
        Game.ui.hpBar.classList.remove('blinking');
    }
}

/**
 * Обновляет индикаторы уровней.
 */
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

/**
 * Удаляет все элементы игрового интерфейса со страницы.
 */
function destroyGameUI() {
    document.querySelector('.game-ui-top')?.remove();
    document.querySelector('.game-ui-bottom')?.remove();
}