/**
 * enemies.js
 * 
 * Управляет логикой всех врагов в игре.
 * - Создание врагов из DOM-элементов.
 * - Обновление их позиций (движение).
 * - Отрисовка (изменение стилей DOM-элементов).
 * - Проверка столкновений с игроком.
 */

/**
 * Конвертирует DOM-элементы стартовой подсказки во врагов типа "Поток".
 * Использует двухэтапный подход для избежания пересчета лейаута во время итерации.
 */
function convertPromptToEnemies() {
    const promptContainer = document.querySelector('.game-start-prompt');
    if (!promptContainer) return;

    // --- ЭТАП 1: Сбор информации ДО изменения DOM ---

    // Находим все будущие вражеские элементы
    const potentialEnemies = Array.from(promptContainer.querySelectorAll('[data-prompt-enemy]'));
    // Создаем массив, чтобы "заморозить" их начальное состояние (позицию и размеры)
    const enemiesInitialState = [];

    potentialEnemies.forEach(el => {
        // Просто считываем и сохраняем данные. Ничего не меняем!
        enemiesInitialState.push({
            el: el,
            rect: el.getBoundingClientRect()
        });
    });

    // --- ЭТАП 2: Нейтрализация родителя (как и раньше) ---

    // Этот блок остается без изменений, он работает правильно.
    const containerRect = promptContainer.getBoundingClientRect();
    promptContainer.style.transform = 'none';
    promptContainer.style.top = `${containerRect.top}px`;
    promptContainer.style.left = `${containerRect.left}px`;
    promptContainer.style.width = `${containerRect.width}px`;
    promptContainer.style.height = `${containerRect.height}px`;

    // --- ЭТАП 3: Применение изменений на основе "замороженных" данных ---

    const enemySpeed = 150;

    // Теперь итерируем по нашему массиву с сохраненными состояниями, а не по DOM-запросу
    enemiesInitialState.forEach(initialState => {
        const { el, rect } = initialState;

        // Применяем position:fixed. Теперь это не влияет на других, т.к. их позиции уже записаны.
        el.classList.add('is-enemy');

        // Устанавливаем стартовые координаты из нашего "снимка"
        el.style.left = `${rect.left}px`;
        el.style.top = `${rect.top}px`;
        el.style.width = `${rect.width}px`;
        el.style.height = `${rect.height}px`;

        // Создаем логический объект для управления
        Game.enemies.push({
            el: el,
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            vy: enemySpeed,
            toRemove: false
        });
    });

    // Делаем контейнер неинтерактивным
    promptContainer.style.pointerEvents = 'none';
}

/**
 * Обновляет состояние всех врагов в каждом кадре.
 * @param {number} deltaTime - Время, прошедшее с прошлого кадра.
 */
function updateEnemies(deltaTime) {
    Game.enemies.forEach(enemy => {
        // Двигаем врага вниз
        enemy.y += enemy.vy * deltaTime;

        // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
        // Проверяем, если ВЕРХНИЙ край врага (`enemy.y`) опустился ниже
        // НИЖНЕЙ границы ОКНА БРАУЗЕРА (`window.innerHeight`).
        if (enemy.y > window.innerHeight) { // БЫЛО: Game.bounds.bottom
            enemy.toRemove = true;
        }
    });

    // Этот блок остается без изменений
    // Удаляем врагов, которые были помечены
    Game.enemies.filter(enemy => enemy.toRemove).forEach(enemy => enemy.el.remove());
    Game.enemies = Game.enemies.filter(enemy => !enemy.toRemove);
}

/**
 * Отрисовывает всех врагов в их новых позициях.
 */
function renderEnemies() {
    Game.enemies.forEach(enemy => {
        enemy.el.style.left = `${enemy.x}px`;
        enemy.el.style.top = `${enemy.y}px`;
    });
}

/**
 * Проверяет столкновение игрока с врагами.
 */
function checkCollisions() {
    if (!Game.isActive || Game.enemies.length === 0) return;

    const player = Game.player;
    if (!player.el) return;

    // --- ГЛАВНОЕ ИЗМЕНЕНИЕ: ПРОВЕРКА НЕУЯЗВИМОСТИ ---
    // Если игрок неуязвим, мы вообще не проверяем столкновения.
    if (player.isInvincible) {
        return;
    }

    const playerHalfWidth = Game.settings.PLAYER_WIDTH / 2;
    const playerHalfHeight = Game.settings.PLAYER_HEIGHT / 2;
    const playerLeft = player.x - playerHalfWidth;
    const playerRight = player.x + playerHalfWidth;
    const playerTop = player.y - playerHalfHeight;
    const playerBottom = player.y + playerHalfHeight;

    Game.enemies.forEach(enemy => {
        if (enemy.toRemove) return;
        
        if (
            playerLeft < enemy.x + enemy.width &&
            playerRight > enemy.x &&
            playerTop < enemy.y + enemy.height &&
            playerBottom > enemy.y
        ) {

            player.el.classList.add('is-shaking');

            // --- Активация неуязвимости (остается без изменений) ---
            player.isInvincible = true;
            player.invincibilityTimer = player.invincibilityDuration;
            player.el.classList.add('is-invincible');

            
            // Убираем класс после завершения анимации, чтобы ее можно было запустить снова
            // Длительность анимации в CSS - 0.4с, что равно 400мс.
            setTimeout(() => {
                player.el?.classList.remove('is-shaking');
            }, 400);

            // В будущем здесь будет switch(enemy.type) для разных врагов
            // Пока считаем, что все враги - "Поток" (наносят урон)

            console.log("Collision detected! Player takes damage.");
            
            // --- ИЗМЕНЕНИЕ: ВРАГ НЕ УДАЛЯЕТСЯ ---
            // enemy.toRemove = true; // <-- ЭТА СТРОКА ЗАКОММЕНТИРОВАНА/УДАЛЕНА
            
            // Наносим урон игроку
            const oldHp = Game.hp;
            Game.hp -= 20;
            if (Game.hp < 0) Game.hp = 0;
            
            if (typeof shakeHpBar === 'function') {
                shakeHpBar();
            }
            if (typeof updateHpBar === 'function') {
                updateHpBar(oldHp);
            }
        }
    });
}

/**
 * Корректирует позицию врагов при изменении размера окна.
 * Это предотвращает "застревание" врагов за пределами нового игрового поля.
 */
function handleEnemyResize() {
    Game.enemies.forEach(enemy => {
        // Просто ограничиваем их текущие координаты новыми границами
        enemy.x = Math.max(
            Game.bounds.left,
            Math.min(enemy.x, Game.bounds.right - enemy.width)
        );
    });
}