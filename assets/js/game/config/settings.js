// assets/js/game/config/settings.js

// Проверяем, существует ли Game.settings, и если да, наполняем его
if (typeof Game !== 'undefined' && typeof Game.settings === 'object') {
    Object.assign(Game.settings, {
        // Игрок
        PLAYER_WIDTH: 28,
        PLAYER_HEIGHT: 28,
        PLAYER_SPEED: 7,

        // Фон
        STAR_COUNT: 150
        
        // ... другие настройки в будущем
    });
}