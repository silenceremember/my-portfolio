// assets/js/game/gameplay/player.js

/**
 * Создает DOM-элемент для корабля игрока и добавляет его в Game.state.
 */
function createPlayer() {
    const playerShipEl = document.createElement('div');
    playerShipEl.id = 'player-ship';
    document.body.appendChild(playerShipEl);

    Game.player.el = playerShipEl;
    // Начальная позиция за пределами экрана для анимации вылета
    Game.player.x = window.innerWidth / 2;
    Game.player.y = window.innerHeight + 50; 
    
    renderPlayer();
}

/**
 * Запускает анимацию вылета корабля на стартовую позицию.
 */
function startPlayerFlyIn() {
    Game.player.isFlyingIn = true;
    Game.player.flyIn.startTime = performance.now();
    Game.player.flyIn.startY = Game.player.y;
    // Целевая позиция: у нижнего края игрового поля
    Game.player.flyIn.targetY = Game.bounds.bottom - Game.settings.PLAYER_HEIGHT - 20; 
    
    if (Game.player.el) {
        Game.player.el.classList.add('visible');
    }
}

/**
 * Обновляет позицию корабля во время анимации вылета.
 * Вызывается в gameLoop.
 * @param {number} currentTime - Текущее время от performance.now()
 */
function updatePlayerFlyIn(currentTime) {
    const flyIn = Game.player.flyIn;
    const elapsedTime = currentTime - flyIn.startTime;

    if (elapsedTime < flyIn.duration) {
        // Используем easing-функцию для плавного замедления
        const progress = elapsedTime / flyIn.duration;
        const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        Game.player.y = flyIn.startY - (flyIn.startY - flyIn.targetY) * easedProgress;
    } else {
        // Анимация завершена
        Game.player.y = flyIn.targetY;
        Game.player.isFlyingIn = false;
    }
}

/**
 * Обновляет позицию игрока на основе нажатых клавиш (через Game.controls).
 * Вызывается в gameLoop, когда игра активна.
 */
function updatePlayerPosition() {
    if (!Game.isActive || !Game.player.el) return;

    const speed = Game.settings.PLAYER_SPEED;
    const playerWidth = Game.settings.PLAYER_WIDTH;
    const playerHeight = Game.settings.PLAYER_HEIGHT;

    // Движение по горизонтали
    if (Game.controls.left) {
        Game.player.x -= speed;
    }
    if (Game.controls.right) {
        Game.player.x += speed;
    }

    // Движение по вертикали
    if (Game.controls.up) {
        Game.player.y -= speed;
    }
    if (Game.controls.down) {
        Game.player.y += speed;
    }

    // Ограничение движения границами игрового поля
    Game.player.x = Math.max(Game.bounds.left + playerWidth / 2, Game.player.x);
    Game.player.x = Math.min(Game.bounds.right - playerWidth / 2, Game.player.x);
    
    Game.player.y = Math.max(Game.bounds.top, Game.player.y);
    Game.player.y = Math.min(Game.bounds.bottom - playerHeight, Game.player.y);
}


/**
 * Отрисовывает (перемещает) DOM-элемент корабля в его текущие координаты.
 * Этот метод полагается на `transform: translate(-50%, -50%)` в CSS для центрирования.
 */
function renderPlayer() {
    if (Game.player.el) {
        Game.player.el.style.left = `${Game.player.x}px`; 
        Game.player.el.style.top = `${Game.player.y}px`;
    }
}