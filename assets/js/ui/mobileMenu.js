// assets/js/ui/mobileMenu.js

function initBurgerMenu() {
    const burgerButton = document.getElementById('burger-menu-button');
    const burgerIcon = burgerButton ? burgerButton.querySelector('.burger-icon') : null;
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileNavPanel = document.querySelector('.mobile-nav');
    const mobileNavLinks = mobileNavPanel ? mobileNavPanel.querySelectorAll('.nav-link') : [];

    if (!burgerButton || !mobileMenuOverlay || !mobileNavPanel || !burgerIcon) {
        console.warn('Burger menu elements not found. Menu will not be initialized.');
        return;
    }

    const openMenu = () => {
        burgerIcon.classList.remove('is-closing');
        document.body.classList.add('menu-open');
    };

    const closeMenu = () => {
        if (!document.body.classList.contains('menu-open')) return;
        burgerIcon.classList.add('is-closing');
        document.body.classList.remove('menu-open');
        setTimeout(() => {
            burgerIcon.classList.remove('is-closing');
        }, 400);
    };

    const toggleMenu = () => {
        if (document.body.classList.contains('menu-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    burgerButton.addEventListener('click', toggleMenu);
    mobileMenuOverlay.addEventListener('click', closeMenu);
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // ====================================================================
    // ===         НОВЫЙ БЛОК: АВТОМАТИЧЕСКОЕ ЗАКРЫТИЕ МЕНЮ           ===
    // ====================================================================

    const MOBILE_BREAKPOINT = 800; // Точка, после которой меню должно быть закрыто
    let isThrottled = false;

    const handleResize = () => {
        // Если ширина окна больше брейкпоинта И меню сейчас открыто
        if (window.innerWidth >= MOBILE_BREAKPOINT && document.body.classList.contains('menu-open')) {
            // Немедленно закрываем меню без анимации закрытия крестика, 
            // так как он все равно исчезнет.
            document.body.classList.remove('menu-open');
            burgerIcon.classList.remove('is-closing');
        }
    };

    window.addEventListener('resize', () => {
        if (!isThrottled) {
            isThrottled = true;
            // Выполняем проверку
            handleResize();
            // Устанавливаем "период охлаждения", чтобы функция не вызывалась слишком часто
            setTimeout(() => {
                isThrottled = false;
            }, 100); // Проверка не чаще раза в 100 мс
        }
    });
}