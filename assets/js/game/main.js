/**
 * ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ
 */
function gameLoop(currentTime) {
    // Эта проверка важна, чтобы цикл остановился, если мы выйдем из игры
    if (!document.body.classList.contains('game-active')) return;

    // Фон должен двигаться всегда, пока игра активна
    updateStars();
    
    // Анимация вылета корабля
    if (Game.player.isFlyingIn) {
        updatePlayerFlyIn(currentTime);
    }
    
    // Геймплей (когда будет реализован)
    if (Game.isActive) {
        // updatePlayerPosition();
        // updateEnemies();
        // checkCollisions();
    }
    
    // Отрисовка игрока
    renderPlayer();

    // Продолжаем цикл на следующем кадре
    requestAnimationFrame(gameLoop);
}


/**
 * ФУНКЦИЯ ЗАПУСКА ИГРЫ
 */
function initGame() {
    if (document.body.classList.contains('game-active')) return;
    console.log("Game mode INITIALIZED.");

    // Этап 1: Блокировка интерфейса и вычисление границ
    document.body.classList.add('game-active');
    Game.bounds = {
        top: 80, bottom: window.innerHeight - 80,
        left: (window.innerWidth / 2) - 350,
        right: (window.innerWidth / 2) + 350,
    };

    // Этап 2: Подготовка сцены (создаем невидимые элементы)
    initStarsCanvas();
    createPlayer();
    const startPrompt = createStartPrompt();

    // Этап 3: Запуск анимаций ПОСЛЕ того, как сработают начальные CSS-переходы
    // Общее время на скрытие UI (0.5s) и сдвиг линий (0.8s, но они начинаются с задержкой 0.5s)
    // Итого, ждем 0.5 + 0.8 = 1.3 секунды.
    const totalAnimationTime = 1300; 

    setTimeout(() => {
        console.log("Starting secondary animations...");
        const starsCanvas = document.getElementById('stars-canvas');
        if (starsCanvas) starsCanvas.classList.add('visible');
        
        startPlayerFlyIn(); // Эта функция делает корабль видимым и запускает его полет
        if (startPrompt) startPrompt.classList.add('visible');
    }, totalAnimationTime);

    // Этап 4: Установка флага готовности игры
    // Ждем, пока пройдут все анимации: 1.3s (линии) + 0.8s (полет корабля) + 2s (пауза для игрока)
    const timeUntilReady = totalAnimationTime + 800 + Game.settings.READY_UP_DELAY;
    setTimeout(() => {
        console.log("Game is ready to start.");
        Game.isReady = true;
        // Здесь можно будет запустить сам геймплей, например, первую волну врагов
    }, timeUntilReady); 

    // Этап 5: Запуск игрового цикла СРАЗУ
    // Он будет отрисовывать фон и полет корабля.
    requestAnimationFrame(gameLoop);
}

// Привязываем initGame к window, чтобы app.js мог ее найти
window.initGame = initGame;