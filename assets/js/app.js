// assets/js/app.js

window.systemState = 'SITE';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Application starting...");

    // 1. ВЫБОР РЕЖИМА ПО УМОЛЧАНИЮ
    const DEFAULT_ACTION = 'secretTerminal'; // 'signalTale' или 'secretTerminal'

    // 2. ПОЛУЧАЕМ ОБРАБОТЧИКИ ДЛЯ КАЖДОГО РЕЖИМА
    const secretTerminalHandlers = getSecretTerminalHandlers();
    
    // Создаем обработчики для Signal Tale
    const signalTaleHandlers = {
        onPrepare: prepareSignalTale,
        onActivate: activateSignalTale,
        onExit: teardownSignalTale,
        onCleanup: cleanupSignalTale,
        onResize: window.signalTaleResizeHandler, // Ссылка на специфичную функцию ресайза
        width: Game.settings.GAME_WIDTH,
        height: Game.settings.GAME_HEIGHT,
        minWindowWidth: Game.settings.MIN_WINDOW_WIDTH, // e.g. 600
        minWindowHeight: Game.settings.MIN_WINDOW_HEIGHT, // e.g. 600
        bodyClass: 'game-mode',
        borderVarPrefix: 'game'
    };

    // 3. ИНИЦИАЛИЗИРУЕМ МЕНЕДЖЕР РЕЖИМОВ
    const modeManager = initModeManager({
        modes: {
            'signalTale': signalTaleHandlers,
            'secretTerminal': secretTerminalHandlers
        }
    });

    // 4. СОЗДАЕМ ГЛОБАЛЬНЫЙ ДИСПЕТЧЕР ДЛЯ QTE И ХОТКЕЕВ
    window.actionHandler = {
        defaultAction: DEFAULT_ACTION,
        trigger: function() {
            console.log(`Action triggered. Default action: ${this.defaultAction}`);
            modeManager.toggleMode(this.defaultAction);
        }
    };

    // Инициализация UI сайта
    if (typeof initThemeSwitcher === 'function') initThemeSwitcher();
    if (typeof initSectionManager === 'function') initSectionManager();

    // Инициализация QTE. Теперь он вызывает actionHandler
    if (typeof initQTE === 'function') {
        initQTE(() => window.actionHandler.trigger());
    } else {
        console.error("initQTE не определена!");
    }
    
    // Отладочный запуск по клавише 'G'
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyG' && document.activeElement.tagName !== 'INPUT') {
            window.actionHandler.trigger();
        }
    });

    console.log("Application initialized.");
});