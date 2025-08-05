// assets/js/game/gameplay/enemies.js

function convertPromptToEnemies() {
    const promptContainer = document.querySelector('.game-start-prompt');
    if (!promptContainer) return;

    const potentialEnemies = Array.from(promptContainer.querySelectorAll('[data-prompt-enemy]'));
    const enemiesInitialState = [];

    potentialEnemies.forEach(el => {
        enemiesInitialState.push({
            el: el,
            rect: el.getBoundingClientRect()
        });
    });

    const containerRect = promptContainer.getBoundingClientRect();
    promptContainer.style.transform = 'none';
    promptContainer.style.top = `${containerRect.top}px`;
    promptContainer.style.left = `${containerRect.left}px`;
    promptContainer.style.width = `${containerRect.width}px`;
    promptContainer.style.height = `${containerRect.height}px`;

    const enemySpeed = 150;

    enemiesInitialState.forEach(initialState => {
        const { el, rect } = initialState;

        el.classList.add('is-enemy');
        el.style.left = `${rect.left}px`;
        el.style.top = `${rect.top}px`;
        el.style.width = `${rect.width}px`;
        el.style.height = `${rect.height}px`;

        Game.enemies.push({
            el: el,
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            vy: enemySpeed,
            toRemove: false,
            // Новые свойства будут добавляться динамически
        });
    });

    promptContainer.style.pointerEvents = 'none';
}


/**
 * <<< ГЛАВНОЕ ИЗМЕНЕНИЕ: Новая логика деспавна >>>
 * Обновляет состояние всех врагов, управляя таймером на удаление за пределами "зоны деспавна".
 * @param {number} deltaTime - Время, прошедшее с прошлого кадра.
 */
function updateEnemies(deltaTime) {
    // --- Шаг 1: Определяем константы и границы "зоны деспавна" ---
    const DESPAWN_TIMER_DURATION = 0; // 3 секунды ожидания
    const FADE_OUT_DURATION = 0.5;    // 0.5 секунды на исчезновение (должно совпадать с CSS transition)

    // Рассчитываем границы зоны 600x600, центрированной в окне
    const despawnZoneWidth = Game.settings.MIN_WINDOW_WIDTH;
    const despawnZoneHeight = Game.settings.MIN_WINDOW_HEIGHT;
    const despawnLeft = (window.innerWidth - despawnZoneWidth) / 2;
    const despawnRight = despawnLeft + despawnZoneWidth;
    const despawnTop = (window.innerHeight - despawnZoneHeight) / 2;
    const despawnBottom = despawnTop + despawnZoneHeight;


    Game.enemies.forEach(enemy => {
        // Пропускаем врагов, которые уже в процессе полного удаления
        if (enemy.toRemove) return;

        // --- Шаг 2: Обновляем позицию врага ---
        enemy.y += enemy.vy * deltaTime;

        // --- Шаг 3: Проверяем, не находится ли враг в процессе исчезновения ---
        if (enemy.isFadingOut) {
            // Если да, то просто уменьшаем таймер до полного удаления из DOM
            enemy.timeUntilRemoval -= deltaTime;
            if (enemy.timeUntilRemoval <= 0) {
                enemy.toRemove = true;
            }
            return; // Больше ничего с этим врагом в этом кадре не делаем
        }

        // --- Шаг 4: Проверяем положение врага относительно "зоны деспавна" ---
        const isOutside =
            enemy.x + enemy.width < despawnLeft ||
            enemy.x > despawnRight ||
            enemy.y + enemy.height < despawnTop ||
            enemy.y > despawnBottom;

        if (isOutside) {
            // Враг за пределами зоны. Запускаем или продолжаем отсчет таймера.
            if (enemy.despawnTimer === undefined) {
                enemy.despawnTimer = DESPAWN_TIMER_DURATION;
            } else {
                enemy.despawnTimer -= deltaTime;
            }

            // Если таймер истек, запускаем процесс исчезновения
            if (enemy.despawnTimer <= 0) {
                enemy.isFadingOut = true;
                enemy.el.classList.add('is-fading-out');
                enemy.timeUntilRemoval = FADE_OUT_DURATION; // Даем время на CSS-анимацию
                delete enemy.despawnTimer; // Таймер больше не нужен
            }
        } else {
            // Враг внутри безопасной зоны. Если таймер был запущен, сбрасываем его.
            if (enemy.despawnTimer !== undefined) {
                delete enemy.despawnTimer;
            }
        }
    });

    // --- Шаг 5: Очистка ---
    // Этот блок остается без изменений, он удаляет всех, кто помечен флагом toRemove
    Game.enemies.filter(e => e.toRemove).forEach(e => e.el.remove());
    Game.enemies = Game.enemies.filter(e => !e.toRemove);
}


function renderEnemies() {
    Game.enemies.forEach(enemy => {
        enemy.el.style.left = `${enemy.x}px`;
        enemy.el.style.top = `${enemy.y}px`;
    });
}


function checkCollisions() {
    if (!Game.isActive || Game.enemies.length === 0 || !Game.player.el || Game.player.isInvincible || Game.isPlayerDying) {
        return;
    }

    const playerHalfWidth = Game.settings.PLAYER_WIDTH / 2;
    const playerHalfHeight = Game.settings.PLAYER_HEIGHT / 2;
    const playerLeft = Game.player.x - playerHalfWidth;
    const playerRight = Game.player.x + playerHalfWidth;
    const playerTop = Game.player.y - playerHalfHeight;
    const playerBottom = Game.player.y + playerHalfHeight;

    Game.enemies.forEach(enemy => {
        if (enemy.toRemove || enemy.isFadingOut) return; // Не сталкиваемся с исчезающими врагами
        
        if (
            playerLeft < enemy.x + enemy.width &&
            playerRight > enemy.x &&
            playerTop < enemy.y + enemy.height &&
            playerBottom > enemy.y
        ) {
            Game.player.el.classList.add('is-shaking');
            Game.player.isInvincible = true;
            Game.player.invincibilityTimer = Game.player.invincibilityDuration;
            Game.player.el.classList.add('is-invincible');
            
            setTimeout(() => {
                Game.player.el?.classList.remove('is-shaking');
            }, 400);

            console.log("Collision detected! Player takes damage.");
            
            const oldHp = Game.hp;
            Game.hp -= 20;
            if (Game.hp < 0) Game.hp = 0;
            
            if (typeof shakeHpBar === 'function') shakeHpBar();
            if (typeof updateHpBar === 'function') updateHpBar(oldHp);

            const overlay = document.getElementById('damage-overlay');
            if (overlay) {
                overlay.classList.remove('is-flashing');
                void overlay.offsetWidth;
                overlay.classList.add('is-flashing');
            }
        }
    });
}


function handleEnemyResize(oldBounds) {
    if (!oldBounds || oldBounds.left === undefined || Game.enemies.length === 0) {
        return;
    }

    const oldGameWidth = oldBounds.right - oldBounds.left;
    const oldGameHeight = oldBounds.bottom - oldBounds.top;

    if (oldGameWidth <= 0 || oldGameHeight <= 0) {
        return;
    }

    const newGameWidth = Game.bounds.right - Game.bounds.left;
    const newGameHeight = Game.bounds.bottom - Game.bounds.top;

    Game.enemies.forEach(enemy => {
        const relativeX = (enemy.x - oldBounds.left) / oldGameWidth;
        const relativeY = (enemy.y - oldBounds.top) / oldGameHeight;

        enemy.x = Game.bounds.left + (relativeX * newGameWidth);
        enemy.y = Game.bounds.top + (relativeY * newGameHeight);
    });
}

function startEnemyFadeOut() {
    console.log("Fading out all enemies...");
    Game.enemies.forEach(enemy => {
        // Мы используем тот же класс, что и для деспавна за экраном.
        // CSS уже настроен для этого.
        if (enemy.el) {
            enemy.el.classList.add('is-fading-out');
        }
    });
}