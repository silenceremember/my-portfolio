function initSectionManager() {
    const sections = document.querySelectorAll('.full-page-section');
    const progressContainer = document.getElementById('section-progress');
    const mainContainer = document.querySelector('main.sections-container');
    if (sections.length === 0 || !progressContainer || !mainContainer) return;

    const MOBILE_BREAKPOINT = 800;

    let currentSectionIndex = 0;
    let isScrolling = false;
    const scrollTimeout = 800;
    const progressDots = [];

    let isMobileLayout = window.innerWidth < MOBILE_BREAKPOINT;

    // >>>>> ФУНКЦИЯ DEBOUNCE ПОЛНОСТЬЮ УДАЛЕНА <<<<<

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

    function updateLayout() {
        const shouldBeMobile = window.innerWidth < MOBILE_BREAKPOINT;
        if (shouldBeMobile === isMobileLayout) return;

        document.body.classList.add('layout-is-switching');

        isMobileLayout = shouldBeMobile;

        if (isMobileLayout) {
            document.body.classList.add('layout-mobile');
            document.body.classList.remove('layout-desktop');
        } else {
            document.body.classList.add('layout-desktop');
            document.body.classList.remove('layout-mobile');
            showSection(currentSectionIndex);
        }
        
        mainContainer.scrollTop = 0;

        requestAnimationFrame(() => {
            document.body.classList.remove('layout-is-switching');
        });
    }
    
    // >>>>> ГЛАВНОЕ ИЗМЕНЕНИЕ <<<<<
    // Убираем debounce и вызываем updateLayout напрямую.
    window.addEventListener('resize', updateLayout);

    // Первоначальная настройка макета
    if (isMobileLayout) {
        document.body.classList.add('layout-mobile');
    } else {
        document.body.classList.add('layout-desktop');
        showSection(0);
    }
}