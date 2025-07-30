document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // КОНФИГУРАЦИЯ И ПЕРЕМЕННЫЕ
    // ======================================================

    // QTE (Konami Code)
    const qteContainer = document.getElementById('qte-container');
    const konamiCodeSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let konamiUserInputPosition = 0;
    const qteKeys = [];

    // Переключение секций
    const sections = document.querySelectorAll('.full-page-section');
    const progressContainer = document.getElementById('section-progress');
    let currentSectionIndex = 0;
    let isScrolling = false;
    const scrollTimeout = 1200;
    const progressDots = [];

    // Переключение темы
    const themeSwitcher = document.getElementById('theme-switcher');


    // ======================================================
    // ФУНКЦИИ
    // ======================================================

    /**
     * Отображает указанную секцию и обновляет индикаторы прогресса.
     * @param {number} index - Индекс секции для отображения.
     */
    function showSection(index) {
        sections.forEach((section, i) => section.classList.toggle('active', i === index));
        progressDots.forEach((dot, i) => dot.classList.toggle('active', i === index));

        // Сбрасываем QTE, если мы ушли с первой секции
        if (index !== 0) {
            resetQTE();
        }
    }

    /**
     * Создает DOM-элементы для QTE-панели.
     */
    function setupQTE() {
        if (!qteContainer) return;
        qteContainer.innerHTML = ''; // Очищаем на случай переинициализации
        qteKeys.length = 0;

        konamiCodeSequence.forEach(() => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('qte-key');
            qteContainer.appendChild(keyElement);
            qteKeys.push(keyElement);
        });
        konamiUserInputPosition = 0;
    }

    /**
     * Сбрасывает прогресс ввода QTE и визуал кнопок.
     */
    function resetQTE() {
        konamiUserInputPosition = 0;
        qteKeys.forEach(key => {
            // Класс .success больше не используется, но оставляем его в сбросе на всякий случай
            key.classList.remove('correct', 'success', 'error-shake');
        });
    }

    /**
     * Вызывается при успешном вводе всего кода Конами.
     */
    function onKonamiSuccess() {
        console.log("Konami Code Activated! Launching game mechanics...");

        // !!! ЛОГИКА АНИМАЦИИ УСПЕХА УДАЛЕНА !!!
        // qteKeys.forEach(key => key.classList.add('success'));

        // Запускаем игровую механику, если она определена в game.js
        if (window.initDestruction) {
            window.initDestruction();
        }

        // Сразу сбрасываем QTE, так как визуального подтверждения успеха больше нет.
        // Это позволяет сразу же начать ввод заново.
        resetQTE();
    }


    // ======================================================
    // ИНИЦИАЛИЗАЦИЯ И ОБРАБОТЧИКИ СОБЫТИЙ
    // ======================================================

    // --- Инициализация прогресса секций ---
    if (progressContainer) {
        sections.forEach(() => {
            const dot = document.createElement('div');
            dot.classList.add('progress-dot');
            progressContainer.appendChild(dot);
            progressDots.push(dot);
        });
    }

    // --- Инициализация QTE ---
    setupQTE();
    
    // --- Первоначальное отображение первой секции ---
    showSection(0);

    // --- Обработчик скролла колесом мыши ---
    window.addEventListener('wheel', (event) => {
        if (isScrolling) return;

        let direction = event.deltaY > 0 ? 1 : -1;
        let nextIndex = currentSectionIndex + direction;

        if (nextIndex >= 0 && nextIndex < sections.length) {
            isScrolling = true;
            currentSectionIndex = nextIndex;
            showSection(currentSectionIndex);
            setTimeout(() => { isScrolling = false; }, scrollTimeout);
        }
    });

    // --- Обработчик нажатий клавиш для QTE ---
    window.addEventListener('keydown', (event) => {
        const section1 = document.getElementById('section-1');
        if (!qteContainer || !section1 || !section1.classList.contains('active')) {
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
                const lastCorrectKeyElement = qteKeys[konamiUserInputPosition - 1];
                lastCorrectKeyElement.classList.add('error-shake');
                
                setTimeout(() => {
                    resetQTE();
                }, 400); 

            }
            // Если ошибка на первом шаге - ничего не делаем, просто сброс произойдет при следующем нажатии
        }
    });

    // --- Обработчик переключения темы ---
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
        });
    }
});