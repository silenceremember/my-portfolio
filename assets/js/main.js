document.addEventListener('DOMContentLoaded', () => {
    // === ЛОГИКА ПЕРЕКЛЮЧЕНИЯ СЕКЦИЙ ===
    const sections = document.querySelectorAll('.full-page-section');
    const progressContainer = document.getElementById('section-progress');
    let currentSectionIndex = 0;
    let isScrolling = false;
    const scrollTimeout = 1200;

    if (progressContainer) {
        sections.forEach(() => {
            const dot = document.createElement('div');
            dot.classList.add('progress-dot');
            progressContainer.appendChild(dot);
        });
    }
    const progressDots = progressContainer ? progressContainer.querySelectorAll('.progress-dot') : [];

    function showSection(index) {
        sections.forEach((section, i) => section.classList.toggle('active', i === index));
        progressDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

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

    showSection(0);

    // === ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ТЕМЫ ===
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            // Можно сохранить выбор в localStorage, чтобы он запоминался
            // localStorage.setItem('theme', newTheme);
        });

        // Проверка сохраненной темы при загрузке
        // const savedTheme = localStorage.getItem('theme');
        // if (savedTheme) {
        //     document.body.setAttribute('data-theme', savedTheme);
        // }
    }
    // === ЛОГИКА QTE (КОД КОНАМИ) - ОБНОВЛЕННАЯ ВЕРСИЯ ===
    const qteContainer = document.getElementById('qte-container');
    
    // Код Конами: ↑, ↑, ↓, ↓, ←, →, ←, →, B, A
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    // Массив с классами/атрибутами для иконок (пока просто для примера)
    const konamiIcons = ['arrow-up', 'arrow-up', 'arrow-down', 'arrow-down', 'arrow-left', 'arrow-right', 'arrow-left', 'arrow-right', 'char-b', 'char-a'];
    
    let userInputPosition = 0;
    const qteKeys = []; 

    // 1. Создаем DOM-элементы для кнопок QTE
    if (qteContainer) {
        konamiIcons.forEach(iconName => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('qte-key');
            
            // Создаем плейсхолдер для иконки внутри
            const iconPlaceholder = document.createElement('div');
            iconPlaceholder.classList.add('qte-icon-placeholder');
            iconPlaceholder.dataset.icon = iconName; // Добавляем data-атрибут для будущей стилизации
            
            keyElement.appendChild(iconPlaceholder);
            qteContainer.appendChild(keyElement);
            qteKeys.push(keyElement);
        });
    }

    // 2. Функция сброса QTE (при ошибке)
    function resetQTE() {
        userInputPosition = 0;
        qteKeys.forEach(key => {
            key.classList.remove('correct', 'error', 'success');
        });
    }

    // 3. Функция, которая вызывается при успешном вводе
    function onKonamiSuccess() {
        console.log("Konami Code Activated!");
        qteKeys.forEach(key => key.classList.add('success'));

        if (window.initDestruction) {
            window.initDestruction(); 
        }

        setTimeout(resetQTE, 3000);
    }

    // 4. Слушатель нажатий клавиш
    window.addEventListener('keydown', (event) => {
        const section1 = document.getElementById('section-1');
        if (!qteContainer || !section1 || !section1.classList.contains('active')) {
            return;
        }
        
        const requiredKey = konamiCode[userInputPosition];
        
        if (event.key.toLowerCase() === requiredKey.toLowerCase()) {
            const currentKeyElement = qteKeys[userInputPosition];
            currentKeyElement.classList.add('correct');
            userInputPosition++;
            
            if (userInputPosition === konamiCode.length) {
                onKonamiSuccess();
            }
        } else if (event.key.length === 1 || event.key.startsWith('Arrow')) { // Реагируем на ошибку только на релевантные клавиши
            qteContainer.classList.add('error');

            setTimeout(() => {
                qteContainer.classList.remove('error');
                resetQTE();
            }, 500);
        }
    });
});