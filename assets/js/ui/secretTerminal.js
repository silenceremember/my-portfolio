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
    const storage = TEST_MODE ? sessionStorage : localStorage; 
    
    let isTyping = false;
    let skipResolver = null;
    let username = '';
    let hasSentMessage = storage.getItem(STORAGE_KEY) === 'true';

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
            if (!String(window.systemState).includes('SECRETTERMINAL')) break;
            if (skipResolver) { // Если пришел запрос на скип, прерываем
                lineElement.textContent = text;
                isTyping = false;
                return; // Выходим из функции
            }
            lineElement.textContent += char;
            await delay(speed);
        }
        isTyping = false;
    }

    function skippableDelay(ms) {
        return new Promise(resolve => {
            const timeoutId = setTimeout(resolve, ms);
            skipResolver = () => {
                clearTimeout(timeoutId);
                resolve();
            };
        }).finally(() => {
            skipResolver = null;
        });
    }

    async function addLine(msg, options = {}) {
        const { isUser = false, isHint = false } = options;
        if (!String(window.systemState).includes('SECRETTERMINAL')) return;
        const output = container.querySelector('.terminal-output');
        if (!output) return;

        const lineEl = document.createElement('div');
        lineEl.className = 'terminal-line';
        if (isUser) { lineEl.classList.add('is-user-message'); }
        if (isHint) { lineEl.classList.add('is-hint-line'); } // Новый класс для подсказок

        const charCountHtml = `<span class="message-char-counter">[${msg.text.length}]</span>`;
        
        // Генерируем разметку в зависимости от типа сообщения
        if (isHint) {
            lineEl.innerHTML = `${charCountHtml}<span class="text"></span>`;
        } else {
            lineEl.innerHTML = `${charCountHtml}<span class="username">${msg.name}></span><span class="text"></span>`;
        }

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
            addLine({ name: username, text: text }, { isUser: true });
            hasSentMessage = true;
            storage.setItem(STORAGE_KEY, 'true');
            lockInput(inputElement);
        }
    }

    const handleSkipRequest = (e) => {
        if (e.type === 'mousedown' || e.key === 'Enter') {
            e.preventDefault();
            if (skipResolver) {
                skipResolver();
            }
        }
    };

    function prepareSecretTerminal() {
        hasSentMessage = storage.getItem(STORAGE_KEY) === 'true';
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
        
        if (hasSentMessage) {
            const input = container.querySelector('.terminal-input');
            lockInput(input);
        }
    }

    function activateSecretTerminal() {
        return new Promise(async (resolve) => {
            container.classList.add('visible');
            const inputLine = container.querySelector('.terminal-input-line');
            const input = container.querySelector('.terminal-input');
            input.disabled = true;

            document.addEventListener('mousedown', handleSkipRequest);
            document.addEventListener('keydown', handleSkipRequest);

            // --- ВЫЗЫВАЕМ ADDLINE С ФЛАГОМ isHint = true ---
            await addLine({ text: '/ ESC TO SEVER /' }, { isHint: true });
            await skippableDelay(1000);

            await addLine({ text: 'LMB/ENTER > NEXT' }, { isHint: true });
            await skippableDelay(1500);

            await addLine({ text: 'YOU GET ONE SHOT' }, { isHint: true });
            await skippableDelay(1000);

            await addLine({ text: 'YOUR VOICE IS 16' }, { isHint: true });
            await skippableDelay(1000);
            
            await addLine({ text: 'LEAVE YOUR TRACE' }, { isHint: true });
            await skippableDelay(2000);
            // -------------------------------------------------

            // Для обычных сообщений флаг не передаем
            for (const msg of simulatedMessages) {
                if (!String(window.systemState).includes('SECRETTERMINAL')) break;
                await skippableDelay(Math.random() * 700 + 200);
                await addLine(msg);
            }
            
            document.removeEventListener('mousedown', handleSkipRequest);
            document.removeEventListener('keydown', handleSkipRequest);
            
            if (inputLine) {
                inputLine.classList.add('visible');
            }
            if (!hasSentMessage) {
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