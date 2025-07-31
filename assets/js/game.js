/**
 * Глобальный объект для хранения состояния и настроек игры.
 */
const Game = {
    isActive: false,
    player: {
        el: null, x: 0, y: 0, width: 30, height: 25,
        isFlyingIn: false,
        flyIn: { startY: 0, targetY: 0, duration: 800, startTime: 0 }
    },
    keys: new Set(),
    bullets: [],
    enemies: [],
    stars: [],
    settings: {
        playerSpeed: 7,
        bulletSpeed: 12,
        fireCooldown: 150,
        readyUpDelay: 2000,
        starCount: 150,
        enemyBaseSpeed: 1,
        enemyWaveInterval: 2000
    },
    bounds: { top: 0, bottom: 0, left: 0, right: 0 },
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

    body.classList.add('game-active');

    const framePaddingVertical = 80;
    const gameFieldWidth = 700;
    Game.bounds.top = framePaddingVertical;
    Game.bounds.bottom = window.innerHeight - framePaddingVertical;
    Game.bounds.left = (window.innerWidth / 2) - (gameFieldWidth / 2);
    Game.bounds.right = (window.innerWidth / 2) + (gameFieldWidth / 2);

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

    function startGameLoop() {
        if (Game.isActive) return;
        Game.isActive = true;
        console.log("GAME STARTED!");

        if (gameUIHeader) gameUIHeader.classList.add('visible');
        if (gameUIFooter) gameUIFooter.classList.add('visible');
        if (startPrompt) startPrompt.remove();

        startLevel(1);

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
    
    window.addEventListener('keydown', startGameTrigger);
    window.addEventListener('keydown', handleGlobalKeys);
}

function handleGlobalKeys(event) {
    if (!document.body.classList.contains('game-active')) return;
    if (event.code === 'Escape') {
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

function handleGameKeys(event) {
    if (event.type === 'keydown') {
        Game.keys.add(event.code);
    } else if (event.type === 'keyup') {
        Game.keys.delete(event.code);
    }
}

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
        updateEnemies();
        checkCollisions();
    }
    
    if (Game.player.el) {
        renderPlayer();
    }
    renderEnemies();

    requestAnimationFrame(gameLoop);
}

function startPlayerFlyIn() {
    Game.player.isFlyingIn = true;
    Game.player.flyIn.startTime = performance.now();
    Game.player.flyIn.startY = Game.player.y;
    Game.player.flyIn.targetY = Game.bounds.bottom - Game.player.height - 20;

    if (Game.player.el) Game.player.el.style.opacity = '1';
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

function startLevel(levelIndex) {
    const section = document.querySelector(`[data-section-id="${levelIndex}"]`);
    if (!section) return;

    const waveConfig = [
        { selector: 'h1',                     delay: 1000,  hp: 6 },
        { selector: '.nickname',              delay: 5000, hp: 6 },
        { selector: '.profession-line > *',   delay: 10000, hp: 3 }, // Ищем ВСЕ дочерние элементы
        { selector: '.philosophy',            delay: 20000, hp: 1 },
        { selector: '[data-destroyable="boss-part"]', delay: 30000, hp: 100 }
    ];

    section.style.visibility = 'visible';
    section.style.opacity = '1';
    section.style.display = 'flex';

    waveConfig.forEach(config => {
        const elements = section.querySelectorAll(config.selector);
        
        elements.forEach((el, index) => {
            // Добавляем небольшую задержку для каждого элемента в волне
            const spawnDelay = config.delay + (index * 200);
            
            setTimeout(() => {
                createEnemiesFromElement(el, config.hp);
            }, spawnDelay);
        });
    });

    setTimeout(() => {
        section.style.visibility = 'hidden';
        section.style.opacity = '0';
        section.style.pointerEvents = 'none';
    }, 100);
}

function processAndSpawn(element, hp) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    if (element.textContent.trim().length > 0 && !element.matches('.hero-photo-placeholder, .separator-icon-large')) {
        const text = element.textContent;
        // !!! НОВОЕ: Получаем стили родителя ОДИН РАЗ перед циклом !!!
        const parentStyles = getComputedStyle(element);

        for (let char of text) {
            if (char.trim() === '') continue;

            const letterEl = document.createElement('span');
            letterEl.className = 'enemy enemy-letter';
            letterEl.textContent = char;

            // !!! ИЗМЕНЕНИЕ: Возвращаем копирование стилей !!!
            Object.assign(letterEl.style, {
                fontSize: parentStyles.fontSize,
                fontWeight: parentStyles.fontWeight,
                fontStyle: parentStyles.fontStyle, // Добавил, чтобы подхватывать italic
                position: 'fixed',
                zIndex: '500',
                transform: 'translate(-50%, -50%)'
            });
            document.body.appendChild(letterEl);
            
            const finalX = Game.bounds.left + Math.random() * (Game.bounds.right - Game.bounds.left);

            Game.enemies.push({
                el: letterEl,
                x: finalX,
                y: -50 - (Math.random() * 200),
                hp: hp,
                speed: Game.settings.enemyBaseSpeed + Math.random() * 1.5
            });
        }
    } 
    else {
        const enemyEl = element.cloneNode(true);
        enemyEl.classList.add('enemy');
        Object.assign(enemyEl.style, {
            position: 'fixed',
            width: `${rect.width}px`, height: `${rect.height}px`,
            margin: '0', zIndex: '500', transform: 'translate(-50%, -50%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        });
        document.body.appendChild(enemyEl);

        const finalX = Math.max(
            Game.bounds.left + rect.width / 2,
            Math.min(Game.bounds.right - rect.width / 2, rect.left + rect.width / 2)
        );

        Game.enemies.push({
            el: enemyEl,
            x: finalX,
            y: -100 - (Math.random() * 200),
            hp: hp,
            speed: Game.settings.enemyBaseSpeed
        });
    }
}


function createEnemyFromElement(element, hp) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return; // Не создаем врагов из невидимых элементов

    // Клонируем элемент, чтобы создать "врага"
    const enemyEl = element.cloneNode(true);
    document.body.appendChild(enemyEl);

    // Если это текстовый элемент, разбиваем его на буквы
    const isText = (element.textContent.trim().length > 0 && !element.matches('.hero-photo-placeholder, .separator-icon-large'));
    if (isText) {
        breakTextIntoSpans(enemyEl);
    }

    // "Зажимаем" X-координату в границах игрового поля
    const finalX = Math.max(
        Game.bounds.left + rect.width / 2,
        Math.min(Game.bounds.right - rect.width / 2, rect.left + rect.width / 2)
    );

    const newEnemy = {
        el: enemyEl,
        x: finalX,
        y: -100 - (Math.random() * 200), // Начинает за экраном
        width: rect.width,
        height: rect.height,
        hp: hp, // Используем HP из конфига
        speed: Game.settings.enemyBaseSpeed + Math.random() * 0.5,
        isText: isText
    };

    // Стилизуем клона как "врага"
    enemyEl.classList.add('enemy');
    enemyEl.style.position = 'fixed';
    enemyEl.style.width = `${rect.width}px`;
    enemyEl.style.height = `${rect.height}px`;
    enemyEl.style.margin = '0';
    enemyEl.style.transformOrigin = 'center center';
    enemyEl.style.display = 'flex';
    enemyEl.style.alignItems = 'center';
    enemyEl.style.justifyContent = 'center';
    enemyEl.style.zIndex = '500';

    Game.enemies.push(newEnemy);
}

function createEnemiesFromElement(element, hp) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // --- ЕСЛИ ЭТО ТЕКСТ -> РАСЩЕПЛЯЕМ НА БУКВЫ ---
    if (element.textContent.trim().length > 0 && !element.matches('.hero-photo-placeholder, .separator-icon-large')) {
        const parentStyles = getComputedStyle(element);
        const text = element.textContent;

        for (let char of text) {
            if (char.trim() === '') continue;
            
            const letterEl = document.createElement('span');
            letterEl.className = 'enemy enemy-letter';
            letterEl.textContent = char;
            Object.assign(letterEl.style, {
                fontSize: parentStyles.fontSize,
                fontWeight: parentStyles.fontWeight,
                color: parentStyles.color,
                fontStyle: parentStyles.fontStyle,
                position: 'fixed', zIndex: '500', transform: 'translate(-50%, -50%)'
            });
            document.body.appendChild(letterEl);
            
            const finalX = Game.bounds.left + Math.random() * (Game.bounds.right - Game.bounds.left);

            Game.enemies.push({
                el: letterEl, x: finalX, y: -50 - (Math.random() * 200),
                hp: hp, speed: Game.settings.enemyBaseSpeed + Math.random() * 1.5
            });
        }
    } 
    // --- ЕСЛИ ЭТО БЛОК -> СОЗДАЕМ ЦЕЛЬНОГО ВРАГА ---
    else {
        const enemyEl = element.cloneNode(true);
        enemyEl.classList.add('enemy');
        Object.assign(enemyEl.style, {
            position: 'fixed', width: `${rect.width}px`, height: `${rect.height}px`,
            margin: '0', zIndex: '500', transform: 'translate(-50%, -50%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        });
        document.body.appendChild(enemyEl);

        const finalX = Game.bounds.left + rect.width / 2 + (Math.random() - 0.5) * (Game.bounds.right - Game.bounds.left - rect.width);

        Game.enemies.push({
            el: enemyEl, x: finalX, y: -100 - (Math.random() * 200),
            hp: hp, speed: Game.settings.enemyBaseSpeed
        });
    }
}

function updateEnemies() {
    for (let i = Game.enemies.length - 1; i >= 0; i--) {
        const enemy = Game.enemies[i];
        enemy.y += enemy.speed;

        // Если враг улетел за экран - просто удаляем его, без перезагрузки
        if (enemy.y > Game.bounds.bottom + enemy.height) {
            enemy.el.remove();
            Game.enemies.splice(i, 1);
            // Тут можно добавить логику потери очков или HP игрока
        }
    }
}

function renderEnemies() {
    for (const enemy of Game.enemies) {
        enemy.el.style.left = `${enemy.x}px`;
        enemy.el.style.top = `${enemy.y}px`;
        enemy.el.style.transform = `translate(-50%, -50%)`;
    }
}

function checkCollisions() {
    for (let i = Game.bullets.length - 1; i >= 0; i--) {
        const bullet = Game.bullets[i];
        if (!bullet) continue;
        const bulletRect = bullet.getBoundingClientRect();

        for (let j = Game.enemies.length - 1; j >= 0; j--) {
            const enemy = Game.enemies[j];
            if (!enemy || !enemy.el) continue;
            const enemyRect = enemy.el.getBoundingClientRect();

            if (bulletRect.left < enemyRect.right &&
                bulletRect.right > enemyRect.left &&
                bulletRect.top < enemyRect.bottom &&
                bulletRect.bottom > enemyRect.top) {

                bullet.remove();
                Game.bullets.splice(i, 1);
                
                enemy.hp--;
                
                enemy.el.classList.add('hit-shake');
                setTimeout(() => enemy.el.classList.remove('hit-shake'), 100);

                if (enemy.hp <= 0) {
                    enemy.el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    enemy.el.style.opacity = '0';
                    enemy.el.style.transform += ' scale(1.5)';
                    setTimeout(() => enemy.el.remove(), 300);
                    Game.enemies.splice(j, 1);
                }
                
                return; // Выходим
            }
        }
    }
}

if (typeof window.initGame === 'undefined') {
    window.initGame = initGame;
}