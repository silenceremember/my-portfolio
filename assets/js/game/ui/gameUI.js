/**
 * Создает все DOM-элементы для игрового интерфейса (HUD).
 */
function createGameUI() {
    // --- Создание верхнего UI (Топливо) ---
    const topUI = document.createElement('div');
    topUI.className = 'game-ui-top';
    
    // 1. Создаем главный контейнер-обертку
    const fuelBarWrapper = document.createElement('div');
    fuelBarWrapper.id = 'fuel-bar-wrapper';

    // 2. Создаем фоновый слой с пустыми сегментами
    const backgroundLayer = document.createElement('div');
    backgroundLayer.className = 'fuel-bar-background';
    for (let i = 0; i < 5; i++) {
        const emptySegment = document.createElement('div');
        emptySegment.className = 'fuel-segment fuel-segment-empty';
        backgroundLayer.appendChild(emptySegment);
    }

    // 3. Создаем слой уровня топлива с заполненными сегментами
    const levelLayer = document.createElement('div');
    levelLayer.id = 'fuel-bar-level'; // JS будет управлять этим элементом
    for (let i = 0; i < 5; i++) {
        const filledSegment = document.createElement('div');
        filledSegment.className = 'fuel-segment fuel-segment-filled';
        levelLayer.appendChild(filledSegment);
    }

    // 4. Собираем структуру: level поверх background, и все это в wrapper
    fuelBarWrapper.appendChild(backgroundLayer);
    fuelBarWrapper.appendChild(levelLayer);
    topUI.appendChild(fuelBarWrapper);
    
    document.body.appendChild(topUI);
    // Сохраняем ссылку на элемент, которым будем управлять
    Game.ui.fuelBar = levelLayer;

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
function updateFuelBar() {
    if (!Game.ui.fuelBar) return;
    
    const percentage = Game.fuel;
    
    // Обновляем ширину шкалы. Логика остается той же!
    Game.ui.fuelBar.style.transform = `scaleX(${percentage / 100})`;
    
    // Проверяем, нужно ли мерцание
    if (percentage > 0 && percentage < 20) {
        Game.ui.fuelBar.classList.add('blinking');
    } else {
        Game.ui.fuelBar.classList.remove('blinking');
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