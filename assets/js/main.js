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
            key.classList.remove('correct', 'success', 'error-shake');
        });
    }

    /**
     * Вызывается при успешном вводе всего кода Конами.
     */
    function onKonamiSuccess() {
        console.log("Konami Code Activated! Launching game mechanics...");
        qteKeys.forEach(key => key.classList.add('success'));

        // Запускаем игровую механику, если она определена в game.js
        if (window.initDestruction) {
            window.initDestruction();
        }

        // Сбрасываем QTE через 2 секунды, чтобы можно было ввести снова
        setTimeout(resetQTE, 2000);
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
            return; // Игнорируем ввод, если мы не на первой секции
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
                    lastCorrectKeyElement.classList.remove('error-shake');
                }, 400); // Длительность анимации
            }
            resetQTE();
        }
    });

    // --- Обработчик переключения темы ---
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            // Для сохранения выбора между сессиями:
            // localStorage.setItem('theme', newTheme);
        });

        // Для восстановления темы при загрузке:
        // const savedTheme = localStorage.getItem('theme');
        // if (savedTheme) {
        //     document.body.setAttribute('data-theme', savedTheme);
        // }
    }
});