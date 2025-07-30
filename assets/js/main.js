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
});