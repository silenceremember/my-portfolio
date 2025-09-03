function initSectionManager() {
    const sections = document.querySelectorAll('.full-page-section');
    const progressContainer = document.getElementById('section-progress');
    const mainContainer = document.querySelector('main.sections-container');
    if (sections.length === 0 || !progressContainer || !mainContainer) return;

    const MOBILE_BREAKPOINT = 800;
    const TRANSITION_DURATION = 300;
    const DEBOUNCE_DELAY = 150; // Задержка для debounce

    let currentSectionIndex = 0;
    let isScrolling = false;
    const scrollTimeout = 800;
    const progressDots = [];
    let isMobileLayout = window.innerWidth < MOBILE_BREAKPOINT;

    // >>>>> DEBOUNCE UTILITY <<<<<
    // Эта функция-помощник гарантирует, что код выполнится только один раз
    // после того, как пользователь прекратит действие (например, ресайз).
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    function updateLayoutClass() {
        if (isMobileLayout) {
            document.body.classList.add('layout-mobile');
            document.body.classList.remove('layout-desktop');
        } else {
            document.body.classList.add('layout-desktop');
            document.body.classList.remove('layout-mobile');
        }
    }

    function showSection(index) {
        if (isMobileLayout) return;
        currentSectionIndex = index;
        sections.forEach((section, i) => section.classList.toggle('active', i === index));
        progressDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    function changeSection(newIndex) {
        if (isMobileLayout || isScrolling || window.systemState !== 'SITE' || newIndex === currentSectionIndex) return;
        if (newIndex >= 0 && newIndex < sections.length) {
            isScrolling = true;
            showSection(newIndex);
            setTimeout(() => { isScrolling = false; }, scrollTimeout);
        }
    }

    sections.forEach((section, index) => {
        const dot = document.createElement('div');
        dot.classList.add('progress-dot');
        dot.addEventListener('click', () => changeSection(index));
        progressContainer.appendChild(dot);
        progressDots.push(dot);
    });

    window.addEventListener('wheel', (event) => {
        if (isMobileLayout || isScrolling || window.systemState !== 'SITE') return;
        const direction = event.deltaY > 0 ? 1 : -1;
        const nextIndex = currentSectionIndex + direction;
        changeSection(nextIndex);
    });

    // --- ОСНОВНАЯ ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ МАКЕТА ---
    function switchLayout() {
        const shouldBeMobile = window.innerWidth < MOBILE_BREAKPOINT;
        if (shouldBeMobile === isMobileLayout) return;

        mainContainer.classList.add('layout-is-switching');

        setTimeout(() => {
            isMobileLayout = shouldBeMobile;
            mainContainer.classList.add('no-section-transitions');
            updateLayoutClass();
            mainContainer.scrollTop = 0;

            if (!isMobileLayout) {
                showSection(currentSectionIndex); // Возвращаемся на тот же слайд
            }

            requestAnimationFrame(() => {
                mainContainer.classList.remove('no-section-transitions');
                mainContainer.classList.remove('layout-is-switching');
            });
        }, TRANSITION_DURATION);
    }
    
    // >>>>> ЗАМЕНА Throttling на Debouncing <<<<<
    // Теперь обработчик resize вызывает функцию switchLayout с задержкой,
    // ожидая, пока пользователь закончит менять размер окна.
    window.addEventListener('resize', debounce(switchLayout, DEBOUNCE_DELAY));


    // >>>>> "СТРАХОВОЧНЫЙ ТРОС" (SAFETY NET) <<<<<
    // Этот обработчик срабатывает, когда пользователь возвращается на вкладку.
    document.addEventListener('visibilitychange', () => {
        // Если вкладка стала видимой
        if (!document.hidden) {
            const shouldBeMobile = window.innerWidth < MOBILE_BREAKPOINT;
            // И если наше JS-состояние не соответствует реальности
            if (shouldBeMobile !== isMobileLayout) {
                console.log("Layout out of sync, forcing update.");
                // Мы МГНОВЕННО исправляем макет без анимации.
                isMobileLayout = shouldBeMobile;
                updateLayoutClass();
                if (!isMobileLayout) {
                    showSection(currentSectionIndex);
                }
            }
        }
    });

    // Первоначальная настройка
    updateLayoutClass();
    if (!isMobileLayout) {
        showSection(0);
    }
}