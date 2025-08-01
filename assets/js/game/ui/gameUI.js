/**
 * Создает все DOM-элементы для игрового интерфейса (HUD).
 */
function createGameUI() {
    // --- Создание верхнего UI (HP) ---
    const topUI = document.createElement('div');
    topUI.className = 'game-ui-top';
    
    const hpBarWrapper = document.createElement('div');
    hpBarWrapper.id = 'hp-bar-wrapper';

    const hpBarContainer = document.createElement('div');
    hpBarContainer.id = 'hp-bar-container';

    // Создаем 5 сегментов
    for (let i = 0; i < 5; i++) {
        const segmentContainer = document.createElement('div');
        segmentContainer.className = 'hp-segment-container';

        const segmentFill = document.createElement('div');
        segmentFill.className = 'hp-segment-fill';
        
        segmentContainer.appendChild(segmentFill);
        hpBarContainer.appendChild(segmentContainer);
        
        // Сохраняем ссылку на элемент ЗАЛИВКИ
        if (!Game.ui.hpBarSegments) Game.ui.hpBarSegments = [];
        Game.ui.hpBarSegments.push(segmentFill);
    }
    
    hpBarWrapper.appendChild(hpBarContainer);
    topUI.appendChild(hpBarWrapper);
    document.body.appendChild(topUI);

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
    if (!Game.ui.hpBarSegments || Game.ui.hpBarSegments.length === 0) return;

    const hp = Game.hp; // от 0 до 100
    const segments = Game.ui.hpBarSegments;
    const totalSegments = segments.length; // 5

    // 1. Вычисляем, сколько сегментов полностью заполнено
    const fullSegments = Math.floor(hp / 20);

    // 2. Вычисляем процент заполнения для "пограничного" сегмента
    const lastSegmentFill = (hp % 20) / 20;

    // 3. Обновляем каждый сегмент
    for (let i = 0; i < totalSegments; i++) {
        if (i < fullSegments) {
            // Этот сегмент полностью заполнен
            segments[i].style.transform = 'scaleX(1)';
        } else if (i === fullSegments) {
            // Это пограничный сегмент
            // Если lastSegmentFill равен 0 и hp не 100, это значит, что мы ровно на границе
            // (например, 80 HP), и этот сегмент должен быть пустым.
            if (lastSegmentFill === 0 && hp !== 100) {
                 segments[i].style.transform = 'scaleX(0)';
            } else {
                 segments[i].style.transform = `scaleX(${lastSegmentFill})`;
            }
        } else {
            // Этот сегмент полностью пуст
            segments[i].style.transform = 'scaleX(0)';
        }
    }
    
    // 4. Управляем мерцанием
    const wrapper = document.getElementById('hp-bar-wrapper');
    if (wrapper) {
        if (hp > 0 && hp <= 20) {
            wrapper.classList.add('blinking');
        } else {
            wrapper.classList.remove('blinking');
        }
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