// assets/js/ui/qte.js

function initQTE(successCallback) {
    const qteContainer = document.getElementById('qte-container');
    if (!qteContainer) return;

    const konamiCodeSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let userInputPosition = 0;
    let isQteLocked = false;
    const qteKeys = [];

    // --- Внутренние функции ---
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

    function resetQTE() {
        userInputPosition = 0;
        qteKeys.forEach(key => {
            key.classList.remove('correct', 'error-shake');
        });
    }

    function onKonamiSuccess() {
        console.log("Konami Code Activated! Launching game mechanics...");
        if (typeof successCallback === 'function') {
            successCallback();
        }
        resetQTE();
    }

    // --- Обработчик событий ---
    window.addEventListener('keydown', (event) => {
        const section1 = document.getElementById('section-1');
        if (!qteContainer || !section1 || !section1.classList.contains('active') || isQteLocked) {
            return;
        }

        const requiredKey = konamiCodeSequence[userInputPosition];
        if (event.code === requiredKey) {
            const currentKeyElement = qteKeys[userInputPosition];
            currentKeyElement.classList.add('correct');
            userInputPosition++;
            if (userInputPosition === konamiCodeSequence.length) {
                onKonamiSuccess();
            }
        } else {
            if (userInputPosition > 0) {
                isQteLocked = true;
                const lastCorrectKeyElement = qteKeys[userInputPosition - 1];
                lastCorrectKeyElement.classList.add('error-shake');
                setTimeout(() => {
                    resetQTE();
                    setTimeout(() => {
                        isQteLocked = false;
                    }, 200);
                }, 400);
            }
        }
    });

    // --- Инициализация ---
    setupQTE();
}