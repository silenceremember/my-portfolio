// assets/js/core/modeManager.js

function initModeManager(config) {
    let activeMode = null;
    let currentModeConfig = {};
    let cursorIdleTimer = null;
    let isTransitioning = false;
    let transitionTimers = { activation: null, cleanup: null };

    function clearAllTransitionTimers() {
        if (transitionTimers.activation) {
            clearTimeout(transitionTimers.activation);
            transitionTimers.activation = null;
        }
        if (transitionTimers.cleanup) {
            clearTimeout(transitionTimers.cleanup);
            transitionTimers.cleanup = null;
        }
    }


    // --- НОВЫЙ БЛОК: Управление курсором (перенесено сюда) ---
    function createCursorBlocker() {
        if (document.getElementById('mode-cursor-blocker')) return;
        const blocker = document.createElement('div');
        blocker.id = 'mode-cursor-blocker';
        blocker.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:9999; cursor:none; display:none;';
        document.body.appendChild(blocker);
    }

    function removeCursorBlocker() {
        document.getElementById('mode-cursor-blocker')?.remove();
        document.body.style.removeProperty('cursor');
    }

    window.hideModeCursor = function() {
        const blocker = document.getElementById('mode-cursor-blocker');
        if (blocker) blocker.style.display = 'block';
    };

    function showModeCursorTemporarily() {
        const blocker = document.getElementById('mode-cursor-blocker');
        if (blocker) blocker.style.display = 'none';
        if (cursorIdleTimer) clearTimeout(cursorIdleTimer);
        cursorIdleTimer = setTimeout(window.hideModeCursor, 1000);
    }

    function revealCursorPermanently() {
        if (cursorIdleTimer) clearTimeout(cursorIdleTimer);
        const blocker = document.getElementById('mode-cursor-blocker');
        if (blocker) blocker.style.display = 'none';
        document.body.style.cursor = 'default';
    }

    // --- ОБЩАЯ ФУНКЦИЯ УПРАВЛЕНИЯ КОМПОНОВКОЙ ---
    function updateLayout() {
        if (!activeMode) return;

        const minWidth = currentModeConfig.minWindowWidth;
        const minHeight = currentModeConfig.minWindowHeight;

        // Проверка на минимальный размер окна
        if (window.innerWidth < minWidth || window.innerHeight < minHeight) {
            if (window.systemState.includes('_ACTIVE') && !isTransitioning) {
                 console.warn("Window is now too small for the active mode. Forcing exit.");
                 toggleMode();
            }
            return;
        }

        const modeWidth = currentModeConfig.width;
        const modeHeight = currentModeConfig.height;

        const offsetX = (window.innerWidth - modeWidth) / 2;
        const offsetY = (window.innerHeight - modeHeight) / 2;

        const root = document.documentElement;
        const borderVarPrefix = currentModeConfig.borderVarPrefix || 'game';
        
        root.style.setProperty(`--${borderVarPrefix}-border-top`, `${offsetY}px`);
        root.style.setProperty(`--${borderVarPrefix}-border-bottom`, `${offsetY}px`);
        root.style.setProperty(`--${borderVarPrefix}-border-left`, `${offsetX}px`);
        root.style.setProperty(`--${borderVarPrefix}-border-right`, `${offsetX}px`);

        // Вызываем специфичный для режима onResize, если он есть
        if (typeof currentModeConfig.onResize === 'function') {
            currentModeConfig.onResize();
        }
        return true; // Сигнал о том, что все в порядке
    }
    
    // --- ОБЩАЯ ФУНКЦИЯ ВХОДА В РЕЖИМ ---
    async function enterMode(modeName) {
        clearAllTransitionTimers();
        isTransitioning = true;
        activeMode = modeName;
        currentModeConfig = config.modes[modeName];

        const minWidth = currentModeConfig.minWindowWidth;
        const minHeight = currentModeConfig.minWindowHeight;

        if (window.innerWidth < minWidth || window.innerHeight < minHeight) {
            console.error(`Cannot enter mode '${modeName}'. Window is too small.`);
            if (typeof window.triggerQteSystemError === 'function') {
                const msg = `ТРЕБУЕТСЯ ОКНО ${minWidth}x${minHeight}`; // Показываем правильные значения
                window.triggerQteSystemError(msg);
            }
            activeMode = null;
            isTransitioning = false;
            return;
        }

        window.systemState = `ENTERING_${modeName.toUpperCase()}`;
        console.log(`System state changed to: ${window.systemState}`);

        if (!updateLayout()) {
            isTransitioning = false;
            window.systemState = 'SITE';
            return;
        }

        if (typeof currentModeConfig.onPrepare === 'function') {
            currentModeConfig.onPrepare();
        }
        createCursorBlocker();
        window.hideModeCursor(); // Требование №1: Сразу скрываем курсор
        window.addEventListener('mousemove', showModeCursorTemporarily);
        window.addEventListener('resize', updateLayout);
        document.addEventListener('keydown', handleEscKey);
        document.body.classList.add('site-ui-hidden');
        setTimeout(() => {
            document.body.classList.add(currentModeConfig.bodyClass); 
        }, 500);

        transitionTimers.activation = setTimeout(async () => {
            document.body.classList.add('no-line-transitions');
            
            // 1. ЖДЕМ ПОЛНОГО ЗАВЕРШЕНИЯ АКТИВАЦИИ
            if (typeof currentModeConfig.onActivate === 'function') {
                await currentModeConfig.onActivate();
            }

            // 2. ТОЛЬКО ПОСЛЕ ЭТОГО меняем состояние и снимаем блокировку
            window.systemState = `${modeName.toUpperCase()}_ACTIVE`;
            console.log(`System state changed to: ${window.systemState}`);
            isTransitioning = false;
        }, 1000); 
    }

    // --- ОБЩАЯ ФУНКЦИЯ ВЫХОДА ИЗ РЕЖИМА ---
    async function exitMode() {
        clearAllTransitionTimers();
        isTransitioning = true;
        revealCursorPermanently();

        const exitStateName = `EXITING_${activeMode.toUpperCase()}`;
        window.systemState = exitStateName;
        console.log(`System state changed to: ${exitStateName}`);

        document.removeEventListener('keydown', handleEscKey);
        window.removeEventListener('resize', updateLayout);
        window.removeEventListener('mousemove', showModeCursorTemporarily);
        if (cursorIdleTimer) clearTimeout(cursorIdleTimer); // Дополнительная очистка таймера
        
        if (typeof currentModeConfig.onExit === 'function') {
            currentModeConfig.onExit();
        }

        const lineReturnDelay = 100;
        setTimeout(() => {
            document.body.classList.remove('no-line-transitions');
            document.body.classList.remove(currentModeConfig.bodyClass);
        }, lineReturnDelay);
        
        const siteAppearDelay = lineReturnDelay + 500;
        setTimeout(() => {
            document.body.classList.add('is-revealing');
            document.body.classList.remove('site-ui-hidden');
        }, siteAppearDelay); 

        transitionTimers.cleanup = setTimeout(async () => {
            document.body.classList.remove('is-revealing');
            removeCursorBlocker();
            
            // 1. ЖДЕМ ЗАВЕРШЕНИЯ ОЧИСТКИ (для будущей совместимости)
            if (typeof currentModeConfig.onCleanup === 'function') {
                await currentModeConfig.onCleanup(); // на случай если cleanup станет асинхронным
            }

            // 2. ТОЛЬКО ПОСЛЕ ЭТОГО сбрасываем состояние и снимаем блокировку
            activeMode = null;
            currentModeConfig = {};
            window.systemState = 'SITE';
            console.log(`System state changed to: ${window.systemState}`);
            isTransitioning = false;
        }, 1100);
    }

    const handleEscKey = async (e) => {
        if (e.key === 'Escape') {
            await toggleMode(); 
        }
    };

    async function toggleMode(modeName) {
        if (isTransitioning) {
            console.warn("Mode transition in progress. Ignoring request.");
            return;
        }
        if (window.systemState === 'SITE') {
            if (modeName) {
                await enterMode(modeName);
            }
        } else if (window.systemState.includes('_ACTIVE')) {
            await exitMode();
        }
    }
    
    // Возвращаем публичный метод для управления
    return {
        toggleMode
    };
}