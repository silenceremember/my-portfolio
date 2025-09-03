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

    // >>>>> НОВАЯ ПЕРЕМЕННАЯ <<<<<
    // Здесь мы будем хранить последнюю активную секцию при переходе на мобильный.
    let lastDesktopSectionIndex = 0; 

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
        
        // >>>>> ИЗМЕНЕНИЕ №1: Запоминаем текущую секцию <<<<<
        // Если мы переходим С ДЕСКТОПА на мобильный, сохраняем текущий индекс.
        if (!isMobileLayout) {
            lastDesktopSectionIndex = currentSectionIndex;
        }

        mainContainer.classList.add('layout-is-switching');

        setTimeout(() => {
            isMobileLayout = shouldBeMobile;

            mainContainer.classList.add('no-section-transitions');

            updateLayoutClass();
            mainContainer.scrollTop = 0;

            if (!isMobileLayout) {
                // >>>>> ИЗМЕНЕНИЕ №2: Используем сохраненный индекс <<<<<
                // Показываем ту секцию, на которой остановились, а не всегда нулевую.
                showSection(lastDesktopSectionIndex);
            }

            requestAnimationFrame(() => {
                mainContainer.classList.remove('no-section-transitions');
                mainContainer.classList.remove('layout-is-switching');
            });

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