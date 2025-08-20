// assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Application starting...");

    // 1. НАШ ГЛАВНЫЙ ПЕРЕКЛЮЧАТЕЛЬ
    const KONAMI_ACTION = 'secretTerminal'; // Варианты: 'startGame', 'secretTerminal'

    // 2. СОЗДАЕМ ГЛОБАЛЬНЫЙ ДИСПЕТЧЕР
    window.konamiHandler = {
        action: KONAMI_ACTION,
        
        // Хранилище для уже инициализированных модулей
        _initializedModules: {},

        // Главная функция, которую будет вызывать QTE
        trigger: function() {
            console.log(`Konami triggered. Action: ${this.action}`);

            if (this.action === 'startGame') {
                if (typeof initGame === 'function') {
                    initGame();
                } else {
                    console.error("initGame is not defined!");
                }

            } else if (this.action === 'secretTerminal') {
                // "Ленивая инициализация":
                // Проверяем, был ли терминал уже инициализирован
                if (!this._initializedModules.terminal) {
                    console.log("Initializing secret terminal for the first time...");
                    if (typeof initSecretTerminal === 'function') {
                        // Вызываем инициализатор ОДИН РАЗ и сохраняем
                        // возвращенную им функцию-переключатель.
                        this._initializedModules.terminal = initSecretTerminal();
                    } else {
                        console.error("initSecretTerminal is not defined!");
                        return; // Прерываем выполнение, если функция не найдена
                    }
                }
                
                // Теперь мы гарантированно вызываем функцию-переключатель (toggleTerminal)
                this._initializedModules.terminal();
            }
        }
    };

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