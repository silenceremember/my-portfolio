// assets/js/game/gameplay/enemies.js

/**
 * Обновляет состояние всех врагов, управляя их движением и жизненным циклом.
 * Это ЕДИНСТВЕННАЯ и ПРАВИЛЬНАЯ версия этой функции.
 * @param {number} deltaTime - Время, прошедшее с прошлого кадра.
 */
function updateEnemies(deltaTime) {
    // Константы для логики исчезновения
    const DESPAWN_TIMER_DURATION = 0;
    const FADE_OUT_DURATION = 0.5;

    // Границы безопасной зоны
    const despawnZoneWidth = Game.settings.MIN_WINDOW_WIDTH;
    const despawnZoneHeight = Game.settings.MIN_WINDOW_HEIGHT;
    const despawnLeft = (window.innerWidth - despawnZoneWidth) / 2;
    const despawnRight = despawnLeft + despawnZoneWidth;
    const despawnTop = (window.innerHeight - despawnZoneHeight) / 2;
    const despawnBottom = despawnTop + despawnZoneHeight;

    Game.enemies.forEach(enemy => {
        if (enemy.toRemove) return;

        // --- 1. ЛОГИКА ДВИЖЕНИЯ (Правильная версия) ---
        // Движение происходит, только если есть соответствующий объект в enemy.
        if (enemy.movement && enemy.movement.pattern === 'flow' && enemy.movement.direction === 'down') {
            enemy.y += enemy.movement.speed * deltaTime;
        }
        // В будущем здесь можно будет добавить другие паттерны.

        // --- 2. ЛОГИКА ИСЧЕЗНОВЕНИЯ ---
        if (enemy.isFadingOut) {
            enemy.timeUntilRemoval -= deltaTime;
            if (enemy.timeUntilRemoval <= 0) {
                enemy.toRemove = true;
            }
            return;
        }

        const isOutside =
            enemy.y > despawnBottom; // Упрощенная проверка, т.к. летят только вниз

        if (isOutside) {
            if (enemy.despawnTimer === undefined) {
                enemy.despawnTimer = DESPAWN_TIMER_DURATION;
            } else {
                enemy.despawnTimer -= deltaTime;
            }
            if (enemy.despawnTimer <= 0) {
                enemy.isFadingOut = true;
                enemy.el.classList.add('is-fading-out');
                enemy.timeUntilRemoval = FADE_OUT_DURATION;
                delete enemy.despawnTimer;
            }
        } else {
            if (enemy.despawnTimer !== undefined) {
                delete enemy.despawnTimer;
            }
        }
    });

    // --- 3. ОЧИСТКА МАССИВА ---
    // Сначала удаляем DOM-элементы, затем фильтруем массив JS-объектов.
    Game.enemies.filter(e => e.toRemove).forEach(e => e.el.remove());
    Game.enemies = Game.enemies.filter(e => !e.toRemove);
}


/**
 * Отрисовывает врагов в их текущих координатах.
 */
function renderEnemies() {
    Game.enemies.forEach(enemy => {
        enemy.el.style.left = `${enemy.x}px`;
        enemy.el.style.top = `${enemy.y}px`;
    });
}


/**
 * Проверяет столкновения игрока с врагами.
 */
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
        if (enemy.toRemove || enemy.isFadingOut) return;
        
        const enemyLeft = enemy.x;
        const enemyRight = enemy.x + enemy.width;
        const enemyTop = enemy.y;
        const enemyBottom = enemy.y + enemy.height;
        
        if (playerLeft < enemyRight && playerRight > enemyLeft && playerTop < enemyBottom && playerBottom > enemyTop) {
            
            // --- Логика получения урона ---
            Game.player.el.classList.add('is-shaking');
            Game.player.isInvincible = true;
            Game.player.invincibilityTimer = Game.player.invincibilityDuration;
            Game.player.el.classList.add('is-invincible');
            setTimeout(() => { Game.player.el?.classList.remove('is-shaking'); }, 400);

            const oldHp = Game.hp;
            Game.hp -= enemy.hp_damage || 20; // Используем урон из чертежа
            if (Game.hp < 0) Game.hp = 0;
            
            if (typeof shakeHpBar === 'function') shakeHpBar();
            if (typeof updateHpBar === 'function') updateHpBar(oldHp);

            const overlay = document.getElementById('damage-overlay');
            if (overlay) {
                overlay.classList.add('visible');
                setTimeout(() => { overlay.classList.remove('visible'); }, 3000);
            }
            
            // --- ИСПРАВЛЕНИЕ: Враг должен исчезнуть после столкновения ---
            enemy.toRemove = true;
        }
    });
}


/**
 * Пересчитывает позицию врагов при изменении размера окна.
 */
function handleEnemyResize(oldBounds) {
    if (!oldBounds || oldBounds.left === undefined || Game.enemies.length === 0) {
        return;
    }

    const oldGameWidth = oldBounds.right - oldBounds.left;
    const oldGameHeight = oldBounds.bottom - oldBounds.top;

    if (oldGameWidth <= 0 || oldGameHeight <= 0) return;

    const newGameWidth = Game.bounds.right - Game.bounds.left;
    const newGameHeight = Game.bounds.bottom - Game.bounds.top;

    Game.enemies.forEach(enemy => {
        const relativeX = (enemy.x - oldBounds.left) / oldGameWidth;
        const relativeY = (enemy.y - oldBounds.top) / oldGameHeight;

        enemy.x = Game.bounds.left + (relativeX * newGameWidth);
        enemy.y = Game.bounds.top + (relativeY * newGameHeight);
    });
}

/**
 * Запускает анимацию исчезновения для всех врагов на экране.
 */
function startEnemyFadeOut() {
    console.log("Fading out all enemies...");
    Game.enemies.forEach(enemy => {
        if (enemy.el) {
            // Класс is-fading-out уже существует в CSS и имеет transition
            // Но для плавного выхода мы будем использовать другой класс
            enemy.el.classList.add('is-hiding');
        }
    });
}