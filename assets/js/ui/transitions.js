function initSectionManager() {
    const sections = document.querySelectorAll('.full-page-section');
    const progressContainer = document.getElementById('section-progress');
    const mainContainer = document.querySelector('main.sections-container');
    if (sections.length === 0 || !progressContainer || !mainContainer) return;

    const MOBILE_BREAKPOINT = 800;
    const TRANSITION_DURATION = 300;

    let currentSectionIndex = 0;
    let isScrolling = false;
    const scrollTimeout = 800;
    const progressDots = [];

    let isMobileLayout = window.innerWidth < MOBILE_BREAKPOINT;

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
        sections.forEach((section, i) => {
            section.classList.toggle('active', i === index);
        });
        progressDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
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

    let isThrottled = false;

    function handleResize() {
        const shouldBeMobile = window.innerWidth < MOBILE_BREAKPOINT;
        if (shouldBeMobile === isMobileLayout) return;

        // 1. Убираем текущую раскладку (плавное исчезновение)
        mainContainer.classList.add('layout-is-switching');

        // 2. Ждем, пока анимация исчезновения закончится
        setTimeout(() => {
            // Обновляем состояние
            isMobileLayout = shouldBeMobile;

            // >>>>> КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Временное отключение всех переходов <<<<<
            // Добавляем класс, который уберет transition со всех секций
            mainContainer.classList.add('no-section-transitions');

            // Меняем класс на body, чтобы применились новые стили
            updateLayoutClass();
            mainContainer.scrollTop = 0;

            // Принудительно ставим нужный слайд для десктопа БЕЗ АНИМАЦИИ
            if (!isMobileLayout) {
                showSection(0);
            }

            // Используем requestAnimationFrame, чтобы гарантировать, что браузер обработал все изменения
            requestAnimationFrame(() => {
                // Возвращаем transition'ы обратно
                mainContainer.classList.remove('no-section-transitions');
                
                // 3. Показываем новую раскладку (плавное появление)
                mainContainer.classList.remove('layout-is-switching');
            });
            // >>>>> КОНЕЦ ИЗМЕНЕНИЯ <<<<<

        }, TRANSITION_DURATION);
    }

    window.addEventListener('resize', () => {
        if (!isThrottled) {
            isThrottled = true;
            handleResize();
            setTimeout(() => { isThrottled = false; }, 100);
        }
    });

    updateLayoutClass();
    if (!isMobileLayout) {
        showSection(0);
    }
}