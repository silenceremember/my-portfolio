// assets/js/ui/qte.js (ПОЛНАЯ ОБНОВЛЕННАЯ ВЕРСИЯ)

function initQTE(successCallback) {
    const qteWrapper = document.getElementById('qte-wrapper');
    if (!qteWrapper) return;
    
    qteWrapper.innerHTML = `
        <div id="qte-container"></div>
        <div id="qte-hint"></div>
    `;
    const qteContainer = qteWrapper.querySelector('#qte-container');
    const qteHintElement = qteWrapper.querySelector('#qte-hint');
    
    const konamiCodeSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let userInputPosition = 0;
    let isQteLocked = false;
    // --- НОВЫЙ ФЛАГ ---
    let isBlockedByScreenSize = false;
    const qteKeys = [];

    function setupQTE() {
        qteContainer.innerHTML = '';
        qteKeys.length = 0;
        konamiCodeSequence.forEach(() => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('qte-key');
            qteContainer.appendChild(keyElement);
            qteKeys.push(keyElement);
        });
        userInputPosition = 0;
    }

    function resetQTE(fadeWithHint = false) {
        // ... (код функции resetQTE остается без изменений)
        userInputPosition = 0;
        qteKeys.forEach(key => {
            if (fadeWithHint && key.classList.contains('correct')) {
                key.classList.add('is-fading-with-hint');
            }
            key.classList.remove('correct', 'error-shake-vertical');
        });
        if (fadeWithHint) {
            setTimeout(() => {
                qteKeys.forEach(key => key.classList.remove('is-fading-with-hint'));
            }, 250);
        }
    }
    window.resetQTE = resetQTE; 

    // ... (код функций triggerInputError, triggerQteSystemError, onKonamiSuccess остается без изменений)
    function triggerInputError(keyIndex) {
        if (isQteLocked) return; isQteLocked = true;
        const keyToShake = qteKeys[keyIndex];
        if (keyToShake) { keyToShake.classList.add('error-shake-vertical'); }
        setTimeout(() => { resetQTE(false); isQteLocked = false; }, 400); 
    }
    function triggerQteSystemError(hintText) {
        if (isQteLocked) return; isQteLocked = true;
        qteHintElement.textContent = hintText;
        qteHintElement.classList.add('visible');
        const lastKey = qteKeys[qteKeys.length - 1];
        if (lastKey) { lastKey.classList.add('error-shake-vertical'); }
        setTimeout(() => {
            qteHintElement.classList.remove('visible');
            resetQTE(true);
            setTimeout(() => { isQteLocked = false; }, 250); 
        }, 1500); 
    }
    window.triggerQteSystemError = triggerQteSystemError;
    function onKonamiSuccess() {
        if (successCallback && typeof successCallback === 'function') {
            successCallback();
        } else {
            console.error("QTE success, but no valid callback was provided to initQTE!");
        }
    }


    // --- НОВАЯ ФУНКЦИЯ: ПРОВЕРКА РАЗМЕРА ЭКРАНА ---
    function checkScreenSize() {
        const isSmall = window.innerWidth < 800;
        if (isSmall && !isBlockedByScreenSize) {
            // Экран стал слишком маленьким
            isBlockedByScreenSize = true;
            resetQTE(); // Сбрасываем прогресс, если он был
        } else if (!isSmall && isBlockedByScreenSize) {
            // Экран снова стал достаточно большим
            isBlockedByScreenSize = false;
        }
    }

    window.addEventListener('keydown', (event) => {
        const section1 = document.getElementById('section-1');
        // --- ОБНОВЛЕННАЯ ПРОВЕРКА ---
        // Добавляем проверку на флаг isBlockedByScreenSize
        if (!qteWrapper || !section1 || !section1.classList.contains('active') || isQteLocked || isBlockedByScreenSize) {
            return;
        }

        if (document.activeElement.tagName === 'INPUT') { return; }

        const requiredKey = konamiCodeSequence[userInputPosition];
        if (event.code === requiredKey) {
            const currentKeyElement = qteKeys[userInputPosition];
            currentKeyElement.classList.add('correct');
            userInputPosition++;
            if (userInputPosition === konamiCodeSequence.length) {
                onKonamiSuccess();
                setTimeout(() => resetQTE(), 500); 
            }
        } else {
            if (userInputPosition > 0) {
                 triggerInputError(userInputPosition - 1);
            }
        }
    });

    setupQTE();
    
    // --- НОВЫЙ КОД: ИНИЦИАЛИЗАЦИЯ ПРОВЕРКИ РАЗМЕРА ЭКРАНА ---
    // Добавляем слушатель события resize для отслеживания изменений
    window.addEventListener('resize', checkScreenSize);
    // Вызываем функцию один раз при загрузке, чтобы установить начальное состояние
    checkScreenSize();
}