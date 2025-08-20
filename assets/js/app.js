// assets/js/app.js

window.systemState = 'SITE';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Application starting...");

    // 1. НАШ ГЛАВНЫЙ ПЕРЕКЛЮЧАТЕЛЬ
    const KONAMI_ACTION = 'secretTerminal'; // Варианты: 'startGame', 'secretTerminal'

    // 2. СОЗДАЕМ ГЛОБАЛЬНЫЙ ДИСПЕТЧЕР
    window.konamiHandler = {
        action: KONAMI_ACTION,
        _initializedModules: {},

        trigger: function() {
            console.log(`Konami triggered. Action: ${this.action}`);

            if (this.action === 'startGame') {
                if (typeof initGame === 'function') initGame();
                else console.error("initGame is not defined!");

            } else if (this.action === 'secretTerminal') {
                if (!this._initializedModules.terminal) {
                    if (typeof initSecretTerminal === 'function') {
                        this._initializedModules.terminal = initSecretTerminal();
                    } else {
                        console.error("initSecretTerminal is not defined!");
                        return;
                    }
                }
                this._initializedModules.terminal();
            }
        }
    };

    // Инициализация UI сайта
    if (typeof initThemeSwitcher === 'function') initThemeSwitcher();
    if (typeof initSectionManager === 'function') initSectionManager();

    // Инициализация QTE. Он больше ничего не принимает.
    if (typeof initQTE === 'function') {
        initQTE();
    } else {
        console.error("initQTE не определена!");
    }
    
    // Отладочный запуск игры по клавише 'G'
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyG' && typeof initGame === 'function') {
            initGame();
        }
    });

    console.log("Application initialized.");
});