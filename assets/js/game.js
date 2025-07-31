/**
 * Глобальный объект для хранения состояния и настроек игры.
 */
const Game = {
    isActive: false, // Флаг для основного геймплея
    player: {
        el: null,     // Ссылка на DOM-элемент
        x: 0,         // Логическая X-координата (центр)
        y: 0,         // Логическая Y-координата (центр)
        width: 30,    // Ширина треугольника (15px*2)
        height: 25,   // Высота треугольника
        isFlyingIn: false, // Флаг для анимации вылета
        flyIn: { 
            startY: 0, 
            targetY: 0, 
            duration: 800, 
            startTime: 0 
        }
    },
    keys: new Set(),
    bullets: [],
    stars: [],
    settings: {
        playerSpeed: 7,
        bulletSpeed: 10,
        fireCooldown: 150,
        readyUpDelay: 2000,
        starCount: 150
    },
    bounds: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    canFire: true,
    canvas: null,
    ctx: null
};

/**
 * Инициализирует игровой режим.
 */
function initGame() {
    if (document.body.classList.contains('game-active')) return;
    console.log("Game mode INITIALIZED.");

    const body = document.body;
    let gameIsReady = false;

    // --- ЭТАП 1: БЛОКИРОВКА ИНТЕРФЕЙСА ---
    body.classList.add('game-active');

    // Вычисляем и сохраняем границы игрового поля
    const framePaddingVertical = 80;
    const gameFieldWidth = 700;
    Game.bounds.top = framePaddingVertical;
    Game.bounds.bottom = window.innerHeight - framePaddingVertical;
    Game.bounds.left = (window.innerWidth / 2) - (gameFieldWidth / 2);
    Game.bounds.right = (window.innerWidth / 2) + (gameFieldWidth / 2);

    // --- ЭТАП 2: ПОДГОТОВКА СЦЕНЫ ---
    initStarsCanvas();

    const gameUIHeader = document.createElement('div');
    gameUIHeader.className = 'game-ui-header';
    gameUIHeader.innerHTML = `<div class="game-hp-bar" id="hp-bar"><div class="hp-block full"></div><div class="hp-block full"></div><div class="hp-block full"></div></div><div class="game-deaths-counter" id="deaths-counter">DEATHS: 0</div>`;
    body.appendChild(gameUIHeader);

    const gameUIFooter = document.createElement('div');
    gameUIFooter.className = 'game-ui-footer';
    gameUIFooter.innerHTML = `<div class="level-block active"></div><div class="level-block upcoming"></div><div class="level-block upcoming"></div><div class="level-block upcoming"></div><div class="level-block upcoming"></div>`;
    body.appendChild(gameUIFooter);

    const playerShipEl = document.createElement('div');
    playerShipEl.id = 'player-ship';
    body.appendChild(playerShipEl);
    Game.player.el = playerShipEl;
    
    Game.player.x = window.innerWidth / 2;
    Game.player.y = window.innerHeight + 50;
    renderPlayer();

    const startPrompt = document.createElement('div');
    startPrompt.className = 'game-start-prompt';
    startPrompt.innerHTML = `<p><kbd>WASD</kbd> - Движение / <kbd>SPACE</kbd> - Стрельба</p><p><kbd>ESC</kbd> - Выход</p>`;
    body.appendChild(startPrompt);

    // --- ЭТАП 3: АНИМАЦИИ И ЗАДЕРЖКА ГОТОВНОСТИ ---
    const totalAnimationTime = 2100;

    setTimeout(() => {
        startPlayerFlyIn();
        if (startPrompt) startPrompt.classList.add('visible');
    }, 100);

    setTimeout(() => {
        console.log("Game is ready to start.");
        gameIsReady = true;
    }, totalAnimationTime + Game.settings.readyUpDelay);

    requestAnimationFrame(gameLoop);

    // --- ЭТАП 4: ОЖИДАНИЕ СТАРТА ИГРЫ ---
    function startGameLoop() {
        if (Game.isActive) return;
        Game.isActive = true;
        console.log("GAME STARTED!");

        if (gameUIHeader) gameUIHeader.classList.add('visible');
        if (gameUIFooter) gameUIFooter.classList.add('visible');
        if (startPrompt) startPrompt.remove();

        window.addEventListener('keydown', handleGameKeys);
        window.addEventListener('keyup', handleGameKeys);
        window.removeEventListener('keydown', startGameTrigger);
    }

    function startGameTrigger(event) {
        if (!gameIsReady) return;
        const key = event.code;
        if (key === 'KeyW' || key === 'KeyA' || key === 'KeyS' || key === 'KeyD' || key === 'Space') {
            startGameLoop();
        }
    }
    
    // Вешаем слушатели: один для старта, другой для глобальных клавиш
    window.addEventListener('keydown', startGameTrigger);
    window.addEventListener('keydown', handleGlobalKeys);
}

/**
 * Обрабатывает глобальные клавиши (ESC). Работает всегда в игровом режиме.
 */
function handleGlobalKeys(event) {
    if (!document.body.classList.contains('game-active')) return;

    if (event.code === 'Escape') {
        // "Чистим" все слушатели, созданные игрой, перед перезагрузкой
        window.removeEventListener('keydown', handleGlobalKeys);
        try {
            window.removeEventListener('keydown', startGameTrigger);
            window.removeEventListener('keydown', handleGameKeys);
            window.removeEventListener('keyup', handleGameKeys);
        } catch (e) {}
        
        console.log("Exiting game, reloading page.");
        window.location.reload();
    }
}

/**
 * Обрабатывает игровые клавиши (WASD, Space). Работает только после старта.
 */
function handleGameKeys(event) {
    if (event.type === 'keydown') {
        Game.keys.add(event.code);
    } else if (event.type === 'keyup') {
        Game.keys.delete(event.code);
    }
}

/**
 * Единый главный игровой цикл.
 */
function gameLoop() {
    if (!document.body.classList.contains('game-active')) return;

    updateStars();

    if (Game.player.isFlyingIn) {
        updatePlayerFlyIn();
    }
    
    if (Game.isActive) {
        updatePlayerPosition();
        handleShooting();
        moveBullets();
    }
    
    if (Game.player.el) {
        renderPlayer();
    }

    requestAnimationFrame(gameLoop);
}

/**
 * Готовит данные для JS-анимации вылета корабля.
 */
function startPlayerFlyIn() {
    Game.player.isFlyingIn = true;
    Game.player.flyIn.startTime = performance.now();
    Game.player.flyIn.startY = Game.player.y;
    Game.player.flyIn.targetY = Game.bounds.bottom - Game.player.height - 20;

    if (Game.player.el) Game.player.el.style.opacity = '1';
}

/**
 * Обновляет позицию корабля во время анимации вылета.
 */
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

/**
 * Обновляет логические координаты игрока во время игры.
 */
function updatePlayerPosition() {
    let dx = 0;
    let dy = 0;
    if (Game.keys.has('KeyA') || Game.keys.has('ArrowLeft')) dx -= Game.settings.playerSpeed;
    if (Game.keys.has('KeyD') || Game.keys.has('ArrowRight')) dx += Game.settings.playerSpeed;
    if (Game.keys.has('KeyW') || Game.keys.has('ArrowUp')) dy -= Game.settings.playerSpeed;
    if (Game.keys.has('KeyS') || Game.keys.has('ArrowDown')) dy += Game.settings.playerSpeed;
    
    Game.player.x += dx;
    Game.player.y += dy;

    Game.player.x = Math.max(Game.bounds.left + Game.player.width / 2, Math.min(Game.bounds.right - Game.player.width / 2, Game.player.x));
    Game.player.y = Math.max(Game.bounds.top + Game.player.height / 2, Math.min(Game.bounds.bottom - Game.player.height / 2, Game.player.y));
}

/**
 * Применяет логические координаты к DOM-элементу игрока.
 */
function renderPlayer() {
    if (Game.player.el) {
        Game.player.el.style.left = `${Game.player.x}px`;
        Game.player.el.style.top = `${Game.player.y}px`;
    }
}

/**
 * Проверяет, нажат ли пробел, и создает пулю с кулдауном.
 */
function handleShooting() {
    if (Game.keys.has('Space') && Game.canFire) {
        createBullet();
        Game.canFire = false;
        setTimeout(() => { Game.canFire = true; }, Game.settings.fireCooldown);
    }
}

/**
 * Создает DOM-элемент для пули.
 */
function createBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = `${Game.player.x - 2}px`;
    bullet.style.top = `${Game.player.y - Game.player.height / 2}px`;
    document.body.appendChild(bullet);
    Game.bullets.push(bullet);
}

/**
 * Двигает все пули и удаляет те, что вышли за пределы экрана.
 */
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

/**
 * Создает и анимирует фон на Canvas.
 */
function initStarsCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'stars-canvas';
    document.body.appendChild(canvas);

    Game.canvas = canvas;
    Game.ctx = canvas.getContext('2d');
    Game.canvas.width = window.innerWidth;
    Game.canvas.height = window.innerHeight;

    for (let i = 0; i < Game.settings.starCount; i++) {
        Game.stars.push({
            x: Math.random() * Game.canvas.width,
            y: Math.random() * -Game.canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 3 + 1
        });
    }
}

function updateStars() {
    if (!Game.ctx) return;
    Game.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
    Game.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color');

    for (let i = 0; i < Game.stars.length; i++) {
        const star = Game.stars[i];
        star.y += star.speed;
        if (star.y > Game.canvas.height) {
            star.y = 0;
            star.x = Math.random() * Game.canvas.width;
        }
        Game.ctx.fillRect(star.x, star.y, star.size, star.size);
    }
}

// Добавляем главную функцию в глобальную область видимости
if (typeof window.initGame === 'undefined') {
    window.initGame = initGame;
}