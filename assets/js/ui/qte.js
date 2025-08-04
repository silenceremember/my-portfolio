// assets/js/ui/qte.js

function initQTE(successCallback) {
    // --- ИЗМЕНЕНИЕ: Ищем обертку, а не контейнер ---
    const qteWrapper = document.getElementById('qte-wrapper');
    if (!qteWrapper) return;
    
    // Создаем контейнер внутри обертки
    qteWrapper.innerHTML = `
        <div id="qte-container"></div>
        <div id="qte-hint"></div>
    `;
    const qteContainer = qteWrapper.querySelector('#qte-container');
    const qteHintElement = qteWrapper.querySelector('#qte-hint');
    
    const konamiCodeSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let userInputPosition = 0;
    let isQteLocked = false;
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
        userInputPosition = 0;

        qteKeys.forEach(key => {
            if (fadeWithHint && key.classList.contains('correct')) {
                key.classList.add('is-fading-with-hint');
            }
            key.classList.remove('correct', 'error-shake-vertical');
        });

        // Через 0.25с убираем модификатор, чтобы вернуть скорость по умолчанию
        if (fadeWithHint) {
            setTimeout(() => {
                qteKeys.forEach(key => key.classList.remove('is-fading-with-hint'));
            }, 250);
        }
    }

    window.resetQTE = resetQTE; 

    // --- ФУНКЦИЯ №1: ОШИБКА ВВОДА (без текста) ---
    function triggerInputError(keyIndex) {
        if (isQteLocked) return;
        isQteLocked = true;

        const keyToShake = qteKeys[keyIndex];
        if (keyToShake) {
            keyToShake.classList.add('error-shake-vertical');
        }

        // Даем время на тряску (0.4с)
        setTimeout(() => {
            resetQTE(false); // Вызываем сброс БЕЗ модификатора (скорость 0.2с)
            isQteLocked = false;
        }, 400); 
    }
    
    // --- ФУНКЦИЯ №2: СИСТЕМНАЯ ОШИБКА (с текстом) ---
    function triggerQteSystemError(hintText) {
        if (isQteLocked) return;
        isQteLocked = true;
        
        qteHintElement.textContent = hintText;
        qteHintElement.classList.add('visible'); // Текст появляется за 0.25с
        
        const lastKey = qteKeys[qteKeys.length - 1];
        if (lastKey) {
            lastKey.classList.add('error-shake-vertical'); // Тряска 0.4с
        }
        
        // Ждем 1.5 секунды, чтобы пользователь успел прочитать текст
        setTimeout(() => {
            // Запускаем синхронное исчезание
            qteHintElement.classList.remove('visible'); // Текст исчезает за 0.25с
            resetQTE(true); // Вызываем сброс С МОДИФИКАТОРОМ (скорость 0.25с)
            
            // Снимаем блокировку после того, как все исчезнет
            setTimeout(() => { isQteLocked = false; }, 250); 
        }, 1500); 
    }
    window.triggerQteSystemError = triggerQteSystemError;
    


    function onKonamiSuccess() {
        console.log("Konami Code Activated! Launching game mechanics...");
        
        // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
        // Просто вызываем колбэк. Никаких проверок или сбросов.
        if (typeof successCallback === 'function') {
            successCallback();
        }
    }

    window.addEventListener('keydown', (event) => {
        const section1 = document.getElementById('section-1');
        if (!qteWrapper || !section1 || !section1.classList.contains('active') || isQteLocked) {
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
                 triggerInputError(userInputPosition - 1);
            }
        }
    });

    setupQTE();
}