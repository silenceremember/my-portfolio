document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // КОНФИГУРАЦИЯ И ПЕРЕМЕННЫЕ
    // ======================================================

    const qteContainer = document.getElementById('qte-container');
    const konamiCodeSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let konamiUserInputPosition = 0;
    let isQteLocked = false;
    const qteKeys = [];

    const sections = document.querySelectorAll('.full-page-section');
    const progressContainer = document.getElementById('section-progress');
    let currentSectionIndex = 0;
    let isScrolling = false;
    const scrollTimeout = 800;
    const progressDots = [];

    const themeSwitcher = document.getElementById('theme-switcher');


    // ======================================================
    // ФУНКЦИИ
    // ======================================================

    function showSection(index) {
        sections.forEach((section, i) => section.classList.toggle('active', i === index));
        progressDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        if (index !== 0) {
            resetQTE();
        }
    }

    function setupQTE() {
        if (!qteContainer) return;
        qteContainer.innerHTML = '';
        qteKeys.length = 0;
        konamiCodeSequence.forEach(() => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('qte-key');
            qteContainer.appendChild(keyElement);
            qteKeys.push(keyElement);
        });
        konamiUserInputPosition = 0;
    }

    function resetQTE() {
        konamiUserInputPosition = 0;
        qteKeys.forEach(key => {
            key.classList.remove('correct', 'error-shake');
        });
    }

    function onKonamiSuccess() {
        console.log("Konami Code Activated! Launching game mechanics...");
        if (window.initGame) {
            window.initGame(); // <-- ВЫЗЫВАЕМ НОВУЮ ИГРУ
        }
        resetQTE();
    }


    // ======================================================
    // ИНИЦИАЛИЗАЦИЯ И ОБРАБОТЧИКИ СОБЫТИЙ
    // ======================================================

    if (progressContainer) {
        sections.forEach((section, index) => {
            const dot = document.createElement('div');
            dot.classList.add('progress-dot');
            dot.addEventListener('click', () => {
                if (isScrolling || currentSectionIndex === index) return;
                isScrolling = true;
                currentSectionIndex = index;
                showSection(index);
                setTimeout(() => { isScrolling = false; }, scrollTimeout);
            });
            progressContainer.appendChild(dot);
            progressDots.push(dot);
        });
    }

    setupQTE();
    showSection(0);

    window.addEventListener('wheel', (event) => {
        if (isScrolling || document.body.classList.contains('game-active')) return;
        let direction = event.deltaY > 0 ? 1 : -1;
        let nextIndex = currentSectionIndex + direction;
        if (nextIndex >= 0 && nextIndex < sections.length) {
            isScrolling = true;
            currentSectionIndex = nextIndex;
            showSection(currentSectionIndex);
            setTimeout(() => { isScrolling = false; }, scrollTimeout);
        }
    });

    // --- ОБРАБОТЧИК НАЖАТИЙ КЛАВИШ ДЛЯ QTE (С ДОПОЛНИТЕЛЬНОЙ ЗАДЕРЖКОЙ) ---
    window.addEventListener('keydown', (event) => {
        const section1 = document.getElementById('section-1');
        
        if (!qteContainer || !section1 || !section1.classList.contains('active') || isQteLocked) {
            return;
        }

        const requiredKey = konamiCodeSequence[konamiUserInputPosition];

        if (event.code === requiredKey) {
            // Правильное нажатие
            const currentKeyElement = qteKeys[konamiUserInputPosition];
            currentKeyElement.classList.add('correct');
            konamiUserInputPosition++;
            if (konamiUserInputPosition === konamiCodeSequence.length) {
                onKonamiSuccess();
            }
        } else {
            // Неправильное нажатие
            if (konamiUserInputPosition > 0) {
                isQteLocked = true; // Запираем ввод

                const lastCorrectKeyElement = qteKeys[konamiUserInputPosition - 1];
                lastCorrectKeyElement.classList.add('error-shake');
                
                // Ждем, пока анимация ошибки (400мс) проиграется
                setTimeout(() => {
                    resetQTE(); // Сбрасываем прогресс
                    
                    // !!! НОВОЕ: Дополнительная задержка в 200мс после сброса !!!
                    // Мы не отпираем ввод сразу, а ждем еще немного.
                    setTimeout(() => {
                        isQteLocked = false; // Отпираем ввод
                    }, 200);

                }, 400); 

            }
        }
    });

    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
        });
    }
});