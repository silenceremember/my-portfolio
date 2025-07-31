// assets/js/game/player.js

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
    Game.player.flyIn.targetY = Game.bounds.bottom - Game.player.height - 20;
    if (Game.player.el) {
        Game.player.el.classList.add('visible');
    }
}

function updatePlayerFlyIn() {
    const elapsedTime = performance.now() - Game.player.flyIn.startTime;
    const flyIn = Game.player.flyIn;
    if (elapsedTime < flyIn.duration) {
        const progress = elapsedTime / flyIn.duration;
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        Game.player.y = flyIn.startY - (flyIn.startY - flyIn.targetY) * easedProgress;
    } else {
        Game.player.y = flyIn.targetY;
        Game.player.isFlyingIn = false;
    }
}

function updatePlayerPosition() {
    let dx = 0; let dy = 0;
    if (Game.keys.has('KeyA') || Game.keys.has('ArrowLeft')) dx -= Game.settings.playerSpeed;
    if (Game.keys.has('KeyD') || Game.keys.has('ArrowRight')) dx += Game.settings.playerSpeed;
    if (Game.keys.has('KeyW') || Game.keys.has('ArrowUp')) dy -= Game.settings.playerSpeed;
    if (Game.keys.has('KeyS') || Game.keys.has('ArrowDown')) dy += Game.settings.playerSpeed;
    Game.player.x += dx;
    Game.player.y += dy;
    Game.player.x = Math.max(Game.bounds.left + Game.player.width / 2, Math.min(Game.bounds.right - Game.player.width / 2, Game.player.x));
    Game.player.y = Math.max(Game.bounds.top + Game.player.height / 2, Math.min(Game.bounds.bottom - Game.player.height / 2, Game.player.y));
}

function renderPlayer() {
    if (Game.player.el) {
        Game.player.el.style.left = `${Game.player.x}px`;
        Game.player.el.style.top = `${Game.player.y}px`;
    }
}

function handleShooting() {
    if (Game.keys.has('Space') && Game.canFire) {
        createBullet();
        Game.canFire = false;
        setTimeout(() => { Game.canFire = true; }, Game.settings.fireCooldown);
    }
}

function createBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = `${Game.player.x - 2}px`;
    bullet.style.top = `${Game.player.y - Game.player.height / 2}px`;
    document.body.appendChild(bullet);
    Game.bullets.push(bullet);
}

function moveBullets() {
    for (let i = Game.bullets.length - 1; i >= 0; i--) {
        const bullet = Game.bullets[i];
        let currentTop = parseFloat(bullet.style.top);
        currentTop -= Game.settings.bulletSpeed;
        bullet.style.top = `${currentTop}px`;
        if (currentTop < Game.bounds.top) {
            bullet.remove();
            Game.bullets.splice(i, 1);
        }
    }
}