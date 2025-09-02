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
    // ===      ИЗМЕНЕННЫЙ БЛОК: АВТОМАТИЧЕСКОЕ ЗАКРЫТИЕ МЕНЮ           ===
    // ====================================================================

    let isThrottled = false;

    // Эта функция теперь просто проверяет, открыто ли меню, и закрывает его.
    const handleResize = () => {
        if (document.body.classList.contains('menu-open')) {
            closeMenu();
        }
    };

    window.addEventListener('resize', () => {
        // Используем throttling, чтобы функция не вызывалась слишком часто.
        if (!isThrottled) {
            isThrottled = true;
            
            // Выполняем проверку
            handleResize();
            
            // Устанавливаем "период охлаждения" в 100 мс.
            setTimeout(() => {
                isThrottled = false;
            }, 100);
        }
    });
}