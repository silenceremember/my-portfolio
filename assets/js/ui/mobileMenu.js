// assets/js/ui/mobileMenu.js

/**
 * Инициализирует функционал мобильного меню (бургера).
 */
function initBurgerMenu() {
    const burgerButton = document.getElementById('burger-menu-button');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    // ИЗМЕНЕНО: Находим панель меню и ссылки в ней по-новому
    const mobileNavPanel = document.querySelector('.mobile-nav');
    const mobileNavLinks = mobileNavPanel ? mobileNavPanel.querySelectorAll('.nav-link') : [];

    if (!burgerButton || !mobileMenuOverlay || !mobileNavPanel) {
        console.warn('Burger menu elements not found. Menu will not be initialized.');
        return;
    }

    const toggleMenu = () => {
        document.body.classList.toggle('menu-open');
    };

    burgerButton.addEventListener('click', toggleMenu);

    // Эта логика теперь работает идеально, т.к. панель не является дочерним элементом
    mobileMenuOverlay.addEventListener('click', () => {
        document.body.classList.remove('menu-open');
    });

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (document.body.classList.contains('menu-open')) {
                document.body.classList.remove('menu-open');
            }
        });
    });
}