// assets/js/game/gameplay/player.js

function createPlayer() {
    const playerShipEl = document.createElement('div');
    playerShipEl.id = 'player-ship';
    document.body.appendChild(playerShipEl);
    Game.player.el = playerShipEl;
    Game.player.x = window.innerWidth / 2;
    Game.player.y = window.innerHeight + 50;
    renderPlayer();
}

function startPlayerFlyIn() {
    Game.player.isFlyingIn = true;
    Game.player.flyIn.startTime = performance.now();
    Game.player.flyIn.startY = Game.player.y;
    Game.player.flyIn.targetY = Game.bounds.bottom - Game.settings.PLAYER_HEIGHT - 20;
    if (Game.player.el) Game.player.el.classList.add('visible');
}

function updatePlayerFlyIn(currentTime) {
    const flyIn = Game.player.flyIn;
    const elapsedTime = currentTime - flyIn.startTime;
    if (elapsedTime < flyIn.duration) {
        const progress = elapsedTime / flyIn.duration;
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        Game.player.y = flyIn.startY - (flyIn.startY - flyIn.targetY) * easedProgress;
    } else {
        Game.player.y = flyIn.targetY;
        Game.player.isFlyingIn = false;
    }
}

function renderPlayer() {
    if (Game.player.el) {
        Game.player.el.style.left = `${Game.player.x}px`;
        Game.player.el.style.top = `${Game.player.y}px`;
    }
}