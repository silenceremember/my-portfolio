// assets/js/game/ui.js

function createGameUI() {
    const body = document.body;
    
    // UI Header
    const gameUIHeader = document.createElement('div');
    gameUIHeader.className = 'game-ui-header';
    gameUIHeader.innerHTML = `<div class="game-hp-bar" id="hp-bar"><div class="hp-block full"></div><div class="hp-block full"></div><div class="hp-block full"></div></div><div class="game-deaths-counter" id="deaths-counter">DEATHS: 0</div>`;
    body.appendChild(gameUIHeader);

    // UI Footer
    const gameUIFooter = document.createElement('div');
    gameUIFooter.className = 'game-ui-footer';
    gameUIFooter.innerHTML = `<div class="level-block active"></div><div class="level-block upcoming"></div><div class="level-block upcoming"></div><div class="level-block upcoming"></div><div class="level-block upcoming"></div>`;
    body.appendChild(gameUIFooter);

    // Start Prompt
    const startPrompt = document.createElement('div');
    startPrompt.className = 'game-start-prompt';
    startPrompt.innerHTML = `<p><kbd>WASD</kbd> - Движение / <kbd>SPACE</kbd> - Стрельба</p><p><kbd>ESC</kbd> - Выход</p>`;
    body.appendChild(startPrompt);
}

function showGameUI() {
    const gameUIHeader = document.querySelector('.game-ui-header');
    const gameUIFooter = document.querySelector('.game-ui-footer');
    if (gameUIHeader) gameUIHeader.classList.add('visible');
    if (gameUIFooter) gameUIFooter.classList.add('visible');
}