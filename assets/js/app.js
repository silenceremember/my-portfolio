// assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Application starting...");

    // Инициализация переключателя темы
    initThemeSwitcher();

    // Инициализация логики QTE. Передаем initGame как коллбэк при успехе.
    initQTE(window.initGame); 

    // Инициализация переключения секций
    initSectionManager();

    console.log("Application initialized.");
});