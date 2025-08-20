// assets/js/ui/secretTerminal.js

function initSecretTerminal() {
    const container = document.getElementById('secret-terminal-container');
    if (!container) return;

    let isActive = false;
    let isTyping = false;

    const username = `User-${Math.random().toString(16).substr(2, 4).toUpperCase()}`;
    const simulatedMessages = [
        { delay: 1000, name: 'SysOp', text: 'Booting virtual shell... OK' },
        { delay: 500, name: 'SysOp', text: 'Connecting to anonymous channel... OK' },
        { delay: 1500, name: 'User-BEEF', text: 'Anyone here?' },
        { delay: 2500, name: 'User-C0DE', text: 'Hello world!' },
        { delay: 2000, name: 'User-1337', text: 'Found it! :)' }
    ];

    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function typeLine(lineElement, text, speed = 50) {
        isTyping = true;
        for (const char of text) {
            lineElement.textContent += char;
            await delay(speed);
        }
        isTyping = false;
    }
    
    async function addLine(msg) {
        const output = container.querySelector('.terminal-output');
        if (!output) return;

        const lineEl = document.createElement('div');
        lineEl.className = 'terminal-line';
        
        const userEl = document.createElement('span');
        userEl.className = 'username';
        userEl.textContent = `${msg.name}> `;
        
        const textEl = document.createElement('span');
        textEl.className = 'text';

        lineEl.appendChild(userEl);
        lineEl.appendChild(textEl);
        output.appendChild(lineEl);

        await typeLine(textEl, msg.text);
        container.scrollTop = container.scrollHeight;
    }

    async function startSimulation() {
        for (const msg of simulatedMessages) {
            if (!isActive) return;
            await delay(msg.delay);
            if (!isActive) return;
            await addLine(msg);
        }
    }

    function handleUserInput(inputElement) {
        if (isTyping) return;
        const text = inputElement.value.trim();
        if (text) {
            addLine({ name: username, text: text });
            inputElement.value = '';
        }
    }

    const handleEscKey = (e) => {
        if (e.key === 'Escape') {
            toggleTerminal();
        }
    };

    function toggleTerminal() {
        isActive = !isActive;
        const body = document.body;
        const siteFrame = document.querySelector('.site-frame');
    
        // 1. Переключаем основной класс-триггер на <body>
        body.classList.toggle('terminal-active');
        
        // 2. Управляем видимостью основного контента сайта и самого терминала
        if (siteFrame) {
            siteFrame.style.opacity = isActive ? '0' : '1';
            siteFrame.style.pointerEvents = isActive ? 'none' : 'auto';
        }
        container.classList.toggle('visible');
    
        if (isActive) {
            // --- БЛОК АКТИВАЦИИ ---
    
            // 3. Задаем РАЗМЕРЫ "поля" для сдвига рамок
            const TERMINAL_WIDTH = 1280;
            const TERMINAL_HEIGHT = 720;
    
            // 4. Рассчитываем отступы
            const offsetX = (window.innerWidth - TERMINAL_WIDTH) / 2;
            const offsetY = (window.innerHeight - TERMINAL_HEIGHT) / 2;
    
            // 5. Устанавливаем CSS-переменные, которые будет использовать _frame.css
            const root = document.documentElement;
            root.style.setProperty('--terminal-border-top', `${offsetY}px`);
            root.style.setProperty('--terminal-border-bottom', `${offsetY}px`);
            root.style.setProperty('--terminal-border-left', `${offsetX}px`);
            root.style.setProperty('--terminal-border-right', `${offsetX}px`);
            
            // 6. Создаем HTML-содержимое терминала
            container.innerHTML = `
                <div class="terminal-output"></div>
                <div class="terminal-input-line">
                    <span class="terminal-prompt">${username}></span>
                    <input type="text" class="terminal-input" maxlength="40" />
                    <div class="terminal-cursor"></div>
                </div>
            `;
    
            // 7. Настраиваем слушатели и запускаем симуляцию
            const input = container.querySelector('.terminal-input');
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleUserInput(input);
            });
            // Даем небольшую задержку для focus, чтобы transition успел сработать
            setTimeout(() => input.focus(), 50); 
    
            document.addEventListener('keydown', handleEscKey);
            startSimulation();
    
        } else {
            // --- БЛОК ДЕАКТИВАЦИИ ---
    
            // 8. Убираем слушатель и очищаем HTML для экономии ресурсов
            document.removeEventListener('keydown', handleEscKey);
            container.innerHTML = '';
        }
    }
    
    return toggleTerminal;
}