/**
 * Создает все DOM-элементы для игрового интерфейса (HUD).
 */
function createGameUI() {

    // --- Создание верхнего UI (HP) ---
    const topUI = document.createElement('div');
    topUI.className = 'game-ui-top';
    
    const hpBarContainer = document.createElement('div');
    hpBarContainer.id = 'hp-bar-container';

    if (!Game.ui.hpBarSegments) Game.ui.hpBarSegments = [];

    for (let i = 0; i < 5; i++) {
        const segmentFill = document.createElement('div');
        segmentFill.className = 'hp-segment-fill';
        
        hpBarContainer.appendChild(segmentFill);
        
        // Сохраняем ссылку на сам сегмент
        Game.ui.hpBarSegments.push(segmentFill);
    }
    
    topUI.appendChild(hpBarContainer);
    document.body.appendChild(topUI);

    // --- Создание нижнего UI (Уровни) ---
    const bottomUI = document.createElement('div');
    bottomUI.className = 'game-ui-bottom';
    const levelIndicators = document.createElement('div');
    levelIndicators.id = 'level-indicators';
    
    if (!Game.ui.levelDots) Game.ui.levelDots = [];

    for (let i = 0; i < 5; i++) {
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
    // Находим главный контейнер шкалы HP
    const hpBarContainer = document.getElementById('hp-bar-container');
    if (!hpBarContainer) return;

    // Добавляем класс, чтобы запустить анимацию
    hpBarContainer.classList.add('shake-animation');

    // Убираем класс после завершения анимации,
    // чтобы ее можно было запустить снова.
    // Время (400ms) должно совпадать с 'animation-duration' в CSS.
    setTimeout(() => {
        hpBarContainer.classList.remove('shake-animation');
    }, 400);
}

/**
 * Обновляет визуальное состояние шкалы HP, управляя каждым сегментом отдельно.
 * (ФИНАЛЬНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ)
 */
function updateHpBar() {
    if (!Game.ui.hpBarSegments || Game.ui.hpBarSegments.length === 0) return;

    const hp = Game.hp;
    const segments = Game.ui.hpBarSegments;
    const totalSegments = segments.length;

    // Шаг 1: Обновление заполнения сегментов
    const fullSegments = Math.floor(hp / 20);
    const lastSegmentFill = (hp % 20) / 20;

    for (let i = 0; i < totalSegments; i++) {
        segments[i].classList.remove('is-blinking');

        if (i < fullSegments) {
            segments[i].style.transform = 'scaleX(1)';
        } else if (i === fullSegments) {
            if (lastSegmentFill === 0 && hp > 0 && hp < 100) {
                 segments[i].style.transform = 'scaleX(0)';
            } else {
                 segments[i].style.transform = `scaleX(${lastSegmentFill})`;
            }
        } else {
            segments[i].style.transform = 'scaleX(0)';
        }
    }
    
    // Шаг 2: Логика мерцания
    if (hp > 0 && hp <= 20) {
        if (segments[0]) {
            segments[0].classList.add('is-blinking');
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