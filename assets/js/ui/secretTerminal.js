// assets/js/ui/secretTerminal.js

function getSecretTerminalHandlers() {
    const container = document.getElementById('secret-terminal-container');
    if (!container) {
        console.error("Secret terminal container not found!");
        return () => {}; // Возвращаем пустую функцию, чтобы избежать ошибок
    }

    let isTyping = false;
    let username = '';
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

    function prepareSecretTerminal() {
        username = `User-${Math.random().toString(16).substr(2, 4).toUpperCase()}`;
        container.innerHTML = `
            <div class="terminal-output"></div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">${username}></span>
                <input type="text" class="terminal-input" maxlength="40" />
                <div class="terminal-cursor"></div>
            </div>
        `;
        const input = container.querySelector('.terminal-input');
        input.addEventListener('keydown', e => { if (e.key === 'Enter') handleUserInput(input); });
    }

    function activateSecretTerminal() {
        return new Promise(resolve => {
            container.classList.add('visible');
            const input = container.querySelector('.terminal-input');
            setTimeout(() => input.focus(), 50);
            startSimulation();
            resolve(); // <--- СИГНАЛ О МГНОВЕННОМ ЗАВЕРШЕНИИ
        });
    }
    
    function teardown() {
        console.log("Tearing down Secret Terminal visuals...");
        container.classList.remove('visible');
    }

    function cleanup() {
        console.log("Cleaning up Secret Terminal state...");
        container.innerHTML = ''; // Очищаем содержимое
    }

    // Возвращаем объект, который app.js передаст в modeManager
    return {
        onPrepare: prepareSecretTerminal,
        onActivate: activateSecretTerminal,
        onCleanup: cleanup,
        width: 1280,
        height: 720,
        minWidth: 800,
        minHeight: 600,
        bodyClass: 'terminal-active',
        borderVarPrefix: 'terminal' // Использует --terminal-border-*
    };
}