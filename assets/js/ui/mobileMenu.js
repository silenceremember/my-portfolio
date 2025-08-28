// assets/js/ui/mobileMenu.js

/**
 * Инициализирует функционал мобильного меню (бургера).
 */
function initBurgerMenu() {
    const burgerButton = document.getElementById('burger-menu-button');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileNavLinks = mobileMenuOverlay ? mobileMenuOverlay.querySelectorAll('.nav-link') : [];

    // Проверяем, существуют ли необходимые элементы
    if (!burgerButton || !mobileMenuOverlay) {
        console.warn('Burger menu elements not found. Menu will not be initialized.');
        return;
    }

    // Функция для переключения состояния меню
    const toggleMenu = () => {
        document.body.classList.toggle('menu-open');
    };

    // Назначаем обработчик на клик по кнопке-бургеру
    burgerButton.addEventListener('click', toggleMenu);

    // Добавляем обработчики на ссылки внутри меню, чтобы оно закрывалось при переходе
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Если меню было открыто, закрываем его
            if (document.body.classList.contains('menu-open')) {
                document.body.classList.remove('menu-open');
            }
        });
    });
}