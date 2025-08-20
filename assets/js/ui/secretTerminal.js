// assets/js/ui/secretTerminal.js

function initSecretTerminal() {
    const container = document.getElementById('secret-terminal-container');
    if (!container) {
        console.error("Secret terminal container not found!");
        return () => {}; // Возвращаем пустую функцию, чтобы избежать ошибок
    }

    let isTyping = false;
    const username = `User-${Math.random().toString(16).substr(2, 4).toUpperCase()}`;
    const simulatedMessages = [
        { delay: 500, name: 'SysOp', text: 'Booting virtual shell... OK' },
        { delay: 300, name: 'SysOp', text: 'Connecting to anonymous channel... OK' },
        { delay: 1000, name: 'User-BEEF', text: 'Anyone here?' },
        { delay: 1500, name: 'User-C0DE', text: 'Hello world!' },
        { delay: 1200, name: 'User-1337', text: 'Found it! :)' }
    ];

    // --- Вспомогательные функции ---

    const delay = ms => new Promise(res => setTimeout(res, ms));
    
    async function typeLine(lineElement, text, speed = 40) {
        isTyping = true;
        for (const char of text) {
            if (window.systemState !== 'TERMINAL_ACTIVE') break; // Прерываем печать, если пользователь вышел
            lineElement.textContent += char;
            await delay(speed);
        }
        isTyping = false;
    }

    async function addLine(msg) {
        if (window.systemState !== 'TERMINAL_ACTIVE') return;
        const output = container.querySelector('.terminal-output');
        if (!output) return;

        const lineEl = document.createElement('div');
        lineEl.className = 'terminal-line';
        lineEl.innerHTML = `<span class="username">${msg.name}></span> <span class="text"></span>`;
        output.appendChild(lineEl);
        
        const textEl = lineEl.querySelector('.text');
        await typeLine(textEl, msg.text);
        container.scrollTop = container.scrollHeight;
    }

    async function startSimulation() {
        for (const msg of simulatedMessages) {
            if (window.systemState !== 'TERMINAL_ACTIVE') return;
            await delay(msg.delay);
            if (window.systemState !== 'TERMINAL_ACTIVE') return;
            await addLine(msg);
        }
    }

    function handleUserInput(inputElement) {
        if (isTyping || window.systemState !== 'TERMINAL_ACTIVE') return;
        const text = inputElement.value.trim();
        if (text) {
            addLine({ name: username, text: text });
            inputElement.value = '';
        }
    }

    // --- Функция для расчета и установки границ ---
    function updateTerminalLayout() {
        // Выполняем расчет, только если мы в одном из состояний терминала
        if (String(window.systemState).indexOf('TERMINAL') === -1) return;
        
        const TERMINAL_WIDTH = 1280; 
        const TERMINAL_HEIGHT = 720;
        
        const offsetX = (window.innerWidth - TERMINAL_WIDTH) / 2;
        const offsetY = (window.innerHeight - TERMINAL_HEIGHT) / 2;
        
        const root = document.documentElement;
        root.style.setProperty('--terminal-border-top', `${offsetY}px`);
        root.style.setProperty('--terminal-border-bottom', `${offsetY}px`);
        root.style.setProperty('--terminal-border-left', `${offsetX}px`);
        root.style.setProperty('--terminal-border-right', `${offsetX}px`);
    }

    // --- Функции управления Входом/Выходом ---
    function enterTerminal() {
        if (window.systemState !== 'SITE') return;
        window.systemState = 'ENTERING_TERMINAL';
        console.log(`System state changed to: ${window.systemState}`);
        
        const body = document.body;
        
        updateTerminalLayout(); // Рассчитываем положение ДО анимации
        window.addEventListener('resize', updateTerminalLayout);

        // Запускаем последовательность анимаций, как в initGame()
        body.classList.add('site-ui-hidden');
        
        setTimeout(() => {
            body.classList.add('terminal-active'); // Этот класс сдвинет рамки
        }, 500);

        setTimeout(() => {
            container.innerHTML = `
                <div class="terminal-output"></div>
                <div class="terminal-input-line">
                    <span class="terminal-prompt">${username}></span>
                    <input type="text" class="terminal-input" maxlength="40" />
                    <div class="terminal-cursor"></div>
                </div>
            `;
            container.classList.add('visible');
            
            const input = container.querySelector('.terminal-input');
            input.addEventListener('keydown', e => { if (e.key === 'Enter') handleUserInput(input); });
            setTimeout(() => input.focus(), 50);

            document.addEventListener('keydown', handleEscKey);
            window.systemState = 'TERMINAL_ACTIVE';
            console.log(`System state changed to: ${window.systemState}`);
            startSimulation();
        }, 1000); // 500ms на скрытие UI + 500ms на сдвиг рамок
    }
    
    function exitTerminal() {
        if (window.systemState !== 'TERMINAL_ACTIVE') return;
        window.systemState = 'EXITING_TERMINAL';
        console.log(`System state changed to: ${window.systemState}`);

        const body = document.body;

        document.removeEventListener('keydown', handleEscKey);
        window.removeEventListener('resize', updateTerminalLayout);
        
        container.classList.remove('visible');
        
        setTimeout(() => {
            body.classList.remove('terminal-active'); // Возвращаем рамки
        }, 100);

        setTimeout(() => {
            body.classList.add('is-revealing');
            body.classList.remove('site-ui-hidden'); // Показываем UI сайта
        }, 600); // 100ms + 500ms на возврат рамок

        setTimeout(() => {
            body.classList.remove('is-revealing');
            container.innerHTML = ''; // Очищаем содержимое
            window.systemState = 'SITE';
            console.log(`System state changed to: ${window.systemState}`);
        }, 1100); // 600ms + 500ms на появление UI
    }

    const handleEscKey = e => { 
        if (e.key === 'Escape') {
            exitTerminal();
        } 
    };
    
    // --- Главная функция-переключатель, которую вернет инициализатор ---
    function toggleTerminal() {
        if (window.systemState === 'SITE') {
            enterTerminal();
        } else if (window.systemState === 'TERMINAL_ACTIVE') {
            exitTerminal();
        }
        // В состояниях ENTERING... и EXITING... вызовы игнорируются, предотвращая баги
    }

    return toggleTerminal;
}