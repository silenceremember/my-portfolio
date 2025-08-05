// assets/js/game/fx/background.js

function initStarsCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'stars-canvas';
    document.body.appendChild(canvas);
    Game.canvas = canvas;
    Game.ctx = canvas.getContext('2d');
    Game.canvas.width = window.innerWidth;
    Game.canvas.height = window.innerHeight;
    Game.stars = [];
    for (let i = 0; i < Game.settings.STAR_COUNT; i++) {
        Game.stars.push({
            x: Math.random() * Game.canvas.width,
            y: Math.random() * Game.canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 3 + 1
        });
    }
}

function updateStars(deltaTime) {
    if (!Game.ctx) return;
    Game.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
    
    const starColor = getComputedStyle(document.body).getPropertyValue('--text-color');
    Game.ctx.fillStyle = starColor;

    for (const star of Game.stars) {
        star.y += star.speed * 60 * deltaTime;

        if (star.y > Game.canvas.height) {
            star.y = 0;
            star.x = Math.random() * Game.canvas.width;
        }
        Game.ctx.fillRect(star.x, star.y, star.size, star.size);
    }
}

function handleStarfieldResize() {
    if (!Game.stars || !Game.canvas) return;
    for (const star of Game.stars) {
        star.x = Math.random() * Game.canvas.width;
        star.y = Math.random() * Game.canvas.height;
    }
}