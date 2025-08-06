// assets/js/game/gameplay/spawner.js

/**
 * Универсальный спаунер для создания игровых сущностей.
 * Он создает новый DOM-элемент с нуля, основываясь на переданной
 * конфигурации и чертеже из Blueprints.
 *
 * @param {object} config - Объект конфигурации для создания сущности.
 * @param {string} config.blueprint - Имя чертежа из Blueprints (например, 'BASE_THREAT').
 * @param {object} config.position - Начальная позиция { x, y }.
 * @param {object} config.size - Размеры { width, height }.
 * @param {object} config.visual - Внешний вид { content, classList }.
 * @returns {object|null} - Возвращает созданный объект сущности или null в случае ошибки.
 */
function spawnEntity(config) {
    // 1. Находим и копируем базовый чертеж
    const blueprint = Blueprints[config.blueprint];
    if (!blueprint) {
        console.error(`[Spawner] Blueprint "${config.blueprint}" not found.`);
        return null;
    }
    const newEntity = { ...JSON.parse(JSON.stringify(blueprint)) };

    // 2. Создаем новый DOM-элемент
    const el = document.createElement('div');
    
    // 3. Применяем визуальные и позиционные стили из config
    el.className = 'game-entity'; // Базовый класс для всех
    if (config.visual.classList) {
        el.classList.add(...config.visual.classList);
    }
    if (config.visual.content) {
        el.innerHTML = config.visual.content; // Используем innerHTML для поддержки SVG
    }

    el.style.position = 'fixed';
    el.style.left = `${config.position.x}px`;
    el.style.top = `${config.position.y}px`;
    el.style.width = `${config.size.width}px`;
    el.style.height = `${config.size.height}px`;

    // 4. Добавляем элемент в игровой мир
    document.body.appendChild(el);

    requestAnimationFrame(() => {
        el.classList.add('is-visible');
    });

    // 5. Собираем полный JS-объект для управления сущностью
    Object.assign(newEntity, {
        el,
        x: config.position.x,
        y: config.position.y,
        width: config.size.width,
        height: config.size.height,
        // ... другие свойства из чертежа уже здесь
    });

    // 6. Добавляем сущность в соответствующий игровой массив
    if (newEntity.type === 'threat') {
        Game.enemies.push(newEntity);
    } 
    // else if (newEntity.type === 'resource') { Game.resources.push(newEntity); }
    
    return newEntity;
}