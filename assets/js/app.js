// assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Application starting...");

    // Инициализация UI сайта
    // Предполагаем, что эти функции определены в скриптах, загруженных ранее
    if (typeof initThemeSwitcher === 'function') initThemeSwitcher();
    if (typeof initSectionManager === 'function') initSectionManager();

    // Инициализация QTE (Konami Code)
    // Мы напрямую передаем функцию initGame в качестве колбэка
    if (typeof initQTE === 'function' && typeof initGame === 'function') {
        initQTE(initGame);
    } else {
        console.error("initQTE или initGame не определены!");
    }
    
    // Отладочный запуск игры по клавише 'G'
    window.addEventListener('keydown', (e) => {
        // Убедимся, что функция initGame существует перед вызовом
        if (e.code === 'KeyG' && typeof initGame === 'function') {
            initGame();
        }
    });

    console.log("Application initialized.");
});