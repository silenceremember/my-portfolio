// assets/js/game/ui.js

/**
 * Создает все DOM-элементы для игрового интерфейса (кроме игрока).
 */
function createGameUI() {
    const body = document.body;
    
    // UI Header (HP и Смерти)
    const gameUIHeader = document.createElement('div');
    gameUIHeader.className = 'game-ui-header';
    gameUIHeader.innerHTML = `
        <div class="game-hp-bar" id="hp-bar">
            <div class="hp-block full"></div>
            <div class="hp-block full"></div>
            <div class="hp-block full"></div>
        </div>
        <div class="game-deaths-counter" id="deaths-counter">DEATHS: 0</div>
    `;
    body.appendChild(gameUIHeader);

    // UI Footer (Уровни)
    const gameUIFooter = document.createElement('div');
    gameUIFooter.className = 'game-ui-footer';
    gameUIFooter.innerHTML = `
        <div class="level-block active"></div>
        <div class="level-block upcoming"></div>
        <div class="level-block upcoming"></div>
        <div class="level-block upcoming"></div>
        <div class="level-block upcoming"></div>
    `;
    body.appendChild(gameUIFooter);

    // Шкала "Шума"
    const noiseBarContainer = document.createElement('div');
    noiseBarContainer.id = 'noise-bar-container';
    noiseBarContainer.innerHTML = `<div id="noise-bar-fill"></div>`;
    body.appendChild(noiseBarContainer);

    // Подсказка для старта
    const startPrompt = document.createElement('div');
    startPrompt.className = 'game-start-prompt';
    startPrompt.innerHTML = `<p><kbd>WASD</kbd> - Движение / <kbd>SPACE</kbd> - Стрельба</p><p><kbd>ESC</kbd> - Выход</p>`;
    body.appendChild(startPrompt);
}

/**
 * Делает видимыми основные элементы игрового UI.
 */
function showGameUI() {
    const gameUIHeader = document.querySelector('.game-ui-header');
    const gameUIFooter = document.querySelector('.game-ui-footer');
    const noiseBar = document.getElementById('noise-bar-container');

    if (gameUIHeader) gameUIHeader.classList.add('visible');
    if (gameUIFooter) gameUIFooter.classList.add('visible');
    if (noiseBar) noiseBar.classList.add('visible');
}

/**
 * Обновляет отображение полоски здоровья.
 */
function updateHpBar() {
    const hpBlocks = document.querySelectorAll('.game-hp-bar .hp-block');
    hpBlocks.forEach((block, index) => {
        block.classList.toggle('full', index < Game.hp);
    });
}

/**
 * Обновляет отображение шкалы "Шума".
 */
function updateNoiseBar() {
    const fill = document.getElementById('noise-bar-fill');
    if (!fill) return;

    // Плавное заполнение шкалы
    const currentWidth = parseFloat(fill.style.width) || 0;
    const targetWidth = Game.noise;
    // Интерполяция для плавности
    fill.style.width = `${currentWidth + (targetWidth - currentWidth) * 0.1}%`;

    if (Game.noise >= 100) {
        console.log("SYSTEM OVERLOAD!");
        // Здесь будет логика системного сбоя (отключение стрельбы и т.д.)
        Game.noise = 0; // Сбрасываем шум
        setTimeout(() => {
            if(fill) fill.style.width = `0%`; // Плавно обнуляем шкалу
        }, 100);
    }
}

/**
 * Создает и анимирует текст перехода между уровнями.
 */
function showTransitionText(text) {
    const transitionText = document.createElement('div');
    transitionText.className = 'level-transition-text';
    transitionText.textContent = text;
    document.body.appendChild(transitionText);

    // Простое появление и исчезновение
    transitionText.style.transition = 'opacity 1s ease-in-out';
    setTimeout(() => transitionText.style.opacity = '1', 10);
    setTimeout(() => transitionText.style.opacity = '0', 2000);
    setTimeout(() => transitionText.remove(), 3000);
}