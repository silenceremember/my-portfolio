// assets/js/app.js

window.systemState = 'SITE';

/**
 * Функция Debounce. Предотвращает слишком частый вызов функции-обработчика,
 * что критически важно для производительности события 'resize'.
 * @param {Function} func - Функция, которую нужно вызывать.
 * @param {number} delay - Задержка в миллисекундах.
 * @returns {Function} - Новая "обернутая" функция.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Application starting...");

    // 1. ВЫБОР РЕЖИМА ПО УМОЛЧАНИЮ
    const DEFAULT_ACTION = 'secretTerminal'; // 'signalTale' или 'secretTerminal'

    // 2. ПОЛУЧАЕМ ОБРАБОТЧИКИ ДЛЯ КАЖДОГО РЕЖИМА
    const secretTerminalHandlers = getSecretTerminalHandlers();
    
    const signalTaleHandlers = {
        onPrepare: prepareSignalTale,
        onActivate: activateSignalTale,
        onExit: teardownSignalTale,
        onCleanup: cleanupSignalTale,
        onResize: window.signalTaleResizeHandler,
        width: Game.settings.GAME_WIDTH,
        height: Game.settings.GAME_HEIGHT,
        minWindowWidth: Game.settings.MIN_WINDOW_WIDTH,
        minWindowHeight: Game.settings.MIN_WINDOW_HEIGHT,
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

    // 5. НОВЫЙ ЦЕНТРАЛЬНЫЙ ОБРАБОТЧИК ИЗМЕНЕНИЯ РАЗМЕРА ОКНА
    const handleResize = () => {
        // Игнорируем resize, если идет анимация смены режима
        if (modeManager.isTransitioning()) {
            console.log("Resize ignored: transition in progress.");
            return;
        }

        switch (window.systemState) {
            case 'SITE':
                // ЗАГЛУШКА: Здесь будет вызов для пересчета размеров секций, если нужно
                // window.sectionManager?.recalculateDimensions();
                console.log("[Resize] Handling for SITE mode.");
                break;

            case 'SIGNAL_TALE_ACTIVE':
                const gameConfig = modeManager.getCurrentModeConfig();
                // Проверяем, не стало ли окно слишком маленьким ВО ВРЕМЯ ИГРЫ
                if (window.innerWidth < gameConfig.minWindowWidth || window.innerHeight < gameConfig.minWindowHeight) {
                    console.warn("Window is now too small for Signal Tale. Forcing exit.");
                    // Показываем системную ошибку через QTE
                    if (typeof window.triggerQteSystemError === 'function') {
                        const msg = `ОКНО СЛИШКОМ МАЛЕНЬКОЕ`;
                        window.triggerQteSystemError(msg, 2000); // Показываем 2 сек
                    }
                    // Запускаем штатный выход из режима
                    modeManager.toggleMode(); 
                }
                break;

            case 'SECRET_TERMINAL_ACTIVE':
                const terminalConfig = modeManager.getCurrentModeConfig();
                 // Вызываем специфичный onResize для терминала, если он есть
                if (typeof terminalConfig.onResize === 'function') {
                    terminalConfig.onResize();
                }
                break;
        }
    };

    // 6. ИНИЦИАЛИЗАЦИЯ ВСЕГО ОСТАЛЬНОГО
    if (typeof initThemeSwitcher === 'function') initThemeSwitcher();
    if (typeof initSectionManager === 'function') initSectionManager();

    if (typeof initQTE === 'function') {
        initQTE(() => window.actionHandler.trigger());
    } else {
        console.error("initQTE не определена!");
    }
    
    // Подключаем наш новый обработчик к событию resize через debounce
    window.addEventListener('resize', debounce(handleResize, 250));

    // Отладочный запуск
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyG' && document.activeElement.tagName !== 'INPUT') {
            window.actionHandler.trigger();
        }
    });

    console.log("Application initialized.");
});