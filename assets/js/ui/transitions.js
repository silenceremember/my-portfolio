function initSectionManager() {
    const sections = document.querySelectorAll('.full-page-section');
    const progressContainer = document.getElementById('section-progress');
    if (sections.length === 0 || !progressContainer) return;

    let currentSectionIndex = 0;
    let isScrolling = false;
    const scrollTimeout = 800;
    const progressDots = [];

    function showSection(index) {
        sections.forEach((section, i) => section.classList.toggle('active', i === index));
        progressDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    function changeSection(newIndex) {
        // --- ИЗМЕНЕНИЕ №1: Условие стало более надежным ---
        // Теперь мы проверяем глобальное состояние. Если оно не 'SITE', ничего не делаем.
        if (isScrolling || window.systemState !== 'SITE' || newIndex === currentSectionIndex) {
            return;
        }

        if (newIndex >= 0 && newIndex < sections.length) {
            isScrolling = true;
            currentSectionIndex = newIndex;
            showSection(currentSectionIndex);
            setTimeout(() => {
                isScrolling = false;
            }, scrollTimeout);
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
        // --- ИЗМЕНЕНИЕ №2: То же самое надежное условие здесь ---
        if (isScrolling || window.systemState !== 'SITE') {
            return;
        }
        
        const direction = event.deltaY > 0 ? 1 : -1;
        const nextIndex = currentSectionIndex + direction;
        changeSection(nextIndex);
    });

    showSection(0);
}