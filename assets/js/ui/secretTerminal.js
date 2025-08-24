// assets/js/ui/secretTerminal.js

function getSecretTerminalHandlers() {
    const container = document.getElementById('secret-terminal-container');
    if (!container) {
        console.error("Secret terminal container not found!");
        return {};
    }


    const TEST_MODE = true; // true = сброс при перезагрузке; false = сохранение на "IP"
    const MAX_CHARS = 16;
    const STORAGE_KEY = 'secretTerminalMessageSent';
    let isTyping = false;
    let isSkipRequested = false; // Флаг для пропуска анимации
    let username = '';
    let hasSentMessage = TEST_MODE ? false : localStorage.getItem(STORAGE_KEY) === 'true';
    const simulatedMessages = [
        { name: 'User-BEEF', text: 'Anyone listening?' },
        { name: 'User-C0DE', text: 'Hello, void.' },
        { name: 'User-1337', text: 'I was here. -J' }
    ];

    // --- Вспомогательные функции ---

    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function typeLine(lineElement, text, speed = 45) {
        isTyping = true;
        for (const char of text) {
            // Прерываем цикл, если пользователь вышел ИЛИ запросил скип
            if (!String(window.systemState).includes('SECRETTERMINAL') || isSkipRequested) break;
            lineElement.textContent += char;
            await delay(speed);
        }
        // В любом случае (скип или конец) допечатываем строку до конца
        lineElement.textContent = text;
        isSkipRequested = false; // Сбрасываем флаг
        isTyping = false;
    }

    async function addLine(msg, isUser = false) {
        if (!String(window.systemState).includes('SECRETTERMINAL')) return;
        const output = container.querySelector('.terminal-output');
        if (!output) return;
    
        const lineEl = document.createElement('div');
        lineEl.className = 'terminal-line';
    
        if (isUser) {
            lineEl.classList.add('is-user-message');
        }
        // --- НОВОЕ ПРАВИЛО ---
        // Добавляем класс для системных сообщений
        if (msg.name === 'SysOp') {
            lineEl.classList.add('is-sysop-message');
        }
    
        const charCountHtml = `<span class="message-char-counter">[${msg.text.length}]</span>`;
        
        // --- НОВОЕ ПРАВИЛО ---
        // Меняем формат имени для SysOp для лучшего вида справа
        const usernameHtml = msg.name === 'SysOp'
            ? `<span class="username"><${msg.name}</span>`
            : `<span class="username">${msg.name}></span>`;
    
        lineEl.innerHTML = `
            ${charCountHtml}
            ${usernameHtml}
            <span class="text"></span>
        `;
        output.appendChild(lineEl);
        
        const textEl = lineEl.querySelector('.text');
        await typeLine(textEl, msg.text);
        container.scrollTop = container.scrollHeight;
    }

    function updateCharCounter(inputElement) {
        const counter = container.querySelector('.char-counter');
        if (!counter) return;
        const remaining = MAX_CHARS - inputElement.value.length;
        counter.textContent = `[${remaining}]`; // ИСПРАВЛЕНИЕ: Формат [XX]
    }

    function lockInput(inputElement) {
        inputElement.disabled = true;
        inputElement.value = '';
        const prompt = container.querySelector('.terminal-prompt');
        if (prompt) prompt.textContent = 'TRANSMISSION LOCKED>';
        const counter = container.querySelector('.char-counter');
        if(counter) counter.textContent = '[LOCKED]';
    }

    function handleUserInput(inputElement) {
        if (isTyping || hasSentMessage) return;
        const text = inputElement.value.trim();
        if (text) {
            addLine({ name: username, text: text }, true);
            hasSentMessage = true;
            if (!TEST_MODE) {
                localStorage.setItem(STORAGE_KEY, 'true'); // Сохраняем, только если не в тестовом режиме
            }
            lockInput(inputElement);
        }
    }

    const handleSkipRequest = (e) => {
        // Скип работает по ЛКМ (mousedown) или по Enter, ТОЛЬКО когда идет анимация
        if (isTyping && (e.type === 'mousedown' || e.key === 'Enter')) {
            e.preventDefault(); // Предотвращаем другие действия
            isSkipRequested = true;
        }
    };

    function prepareSecretTerminal() {
        hasSentMessage = localStorage.getItem(STORAGE_KEY) === 'true';
        username = `User-${Math.random().toString(16).substr(2, 4).toUpperCase()}`;
        
        container.innerHTML = `
            <div class="terminal-output"></div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">${username}></span>
                <input type="text" class="terminal-input" maxlength="${MAX_CHARS}" />
                <div class="input-suffix">
                    <span class="char-counter">[${MAX_CHARS}]</span>
                    <div class="terminal-cursor"></div>
                </div>
            </div>
        `;
        const input = container.querySelector('.terminal-input');
        input.addEventListener('keydown', e => { if (e.key === 'Enter') handleUserInput(input); });
        input.addEventListener('input', () => updateCharCounter(input));
    }

    function activateSecretTerminal() {
        return new Promise(async (resolve) => {
            container.classList.add('visible');
            const input = container.querySelector('.terminal-input');
            input.disabled = true;

            // Включаем слушатели на скип ПЕРЕД началом анимаций
            document.addEventListener('mousedown', handleSkipRequest);
            document.addEventListener('keydown', handleSkipRequest);

            await addLine({ name: 'SysOp', text: '/ ESC TO SEVER /' });
            if (isSkipRequested) await delay(50); else await delay(1000);

            await addLine({ name: 'SysOp', text: 'LMB/ENTER > NEXT' });
            if (isSkipRequested) await delay(50); else await delay(1500);

            await addLine({ name: 'SysOp', text: 'YOU GET ONE SHOT' });
            if (isSkipRequested) await delay(50); else await delay(1000);

            await addLine({ name: 'SysOp', text: 'YOUR VOICE IS 16' });
            if (isSkipRequested) await delay(50); else await delay(1000);
            
            await addLine({ name: 'SysOp', text: 'LEAVE YOUR TRACE' });
            if (isSkipRequested) await delay(50); else await delay(2000);

            for (const msg of simulatedMessages) {
                if (!String(window.systemState).includes('SECRETTERMINAL')) break;
                if (isSkipRequested) await delay(50); else await delay(Math.random() * 700 + 200);
                await addLine(msg);
            }
            
            // Выключаем слушатели ПОСЛЕ всех анимаций
            document.removeEventListener('mousedown', handleSkipRequest);
            document.removeEventListener('keydown', handleSkipRequest);
            
            if (hasSentMessage) {
                lockInput(input);
            } else {
                input.disabled = false;
                setTimeout(() => input.focus(), 50);
            }
            
            resolve();
        });
    }

    function teardown() {
        console.log("Tearing down Secret Terminal visuals...");
        container.classList.remove('visible');
        // Гарантированно отключаем слушатели при выходе
        document.removeEventListener('mousedown', handleSkipRequest);
        document.removeEventListener('keydown', handleSkipRequest);
    }

    function cleanup() {
        console.log("Cleaning up Secret Terminal state...");
        container.innerHTML = '';
    }

    // Возвращаем объект, который app.js передаст в modeManager
    return {
        onPrepare: prepareSecretTerminal,
        onActivate: activateSecretTerminal,
        onExit: teardown,
        onCleanup: cleanup,
        width: 1280,
        height: 720,
        minWindowWidth: 800,
        minWindowHeight: 600,
        bodyClass: 'terminal-active',
        borderVarPrefix: 'terminal'
    };
}