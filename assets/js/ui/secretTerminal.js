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
    
    let isAnimationActive = false;
    let isPrintingLine = false;  // НОВЫЙ ФЛАГ: true, пока печатается ЛЮБАЯ часть строки
    let isSkipRequested = false;   // Флаг для скипа ПЕЧАТИ
    let skipDelayResolver = null;  // Функция для скипа ПАУЗЫ

    let username = '';
    let hasSentMessage = storage.getItem(STORAGE_KEY) === 'true';

    const simulatedMessages = [
        { name: 'User-BEEF', text: 'Anyone listening?' },
        { name: 'User-C0DE', text: 'Hello, void.' },
        { name: 'User-1337', text: 'I was here. -J' }
    ];

    // --- Вспомогательные функции ---

    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function typeContent(target, text, speed = 45) {
        // Если флаг уже поднят, допечатываем и выходим
        if (isSkipRequested) {
            target.textContent = text;
            return;
        }
        for (const char of text) {
            if (!isAnimationActive) return;
            if (isSkipRequested) break; // Просто прерываем цикл
            target.textContent += char;
            await delay(speed);
        }
        target.textContent = text;
    }

    function skippableDelay(ms) {
        return new Promise(resolve => {
            const timeoutId = setTimeout(resolve, ms);
            skipDelayResolver = () => {
                clearTimeout(timeoutId);
                resolve();
            };
        }).finally(() => {
            skipDelayResolver = null;
        });
    }

    async function addLine(msg, options = {}) {
        const { isUser = false, isHint = false } = options;
        if (!isAnimationActive) return;

        isPrintingLine = true; // --- ВКЛЮЧАЕМ РЕЖИМ ПЕЧАТИ ---
        const output = container.querySelector('.terminal-output');
        if (!output) return;

        const lineEl = document.createElement('div');
        lineEl.className = 'terminal-line';
        if (isUser) lineEl.classList.add('is-user-message');
        if (isHint) lineEl.classList.add('is-hint-line');

        // Создаем пустую структуру
        const counterEl = document.createElement('span');
        counterEl.className = 'message-char-counter';
        
        const textEl = document.createElement('span');
        textEl.className = 'text';

        if (isHint) {
            lineEl.append(counterEl, textEl);
        } else {
            const userEl = document.createElement('span');
            userEl.className = 'username';
            lineEl.append(counterEl, userEl, textEl);
        }
        output.appendChild(lineEl);
        
        // ПОСЛЕДОВАТЕЛЬНО анимируем каждую часть
        await typeContent(counterEl, `[${msg.text.length}]`);
        if (!isHint) {
            await typeContent(lineEl.querySelector('.username'), `${msg.name}>`);
        }
        await typeContent(textEl, msg.text);

        container.scrollTop = container.scrollHeight;
        isPrintingLine = false;
        isSkipRequested = false;
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
            // Если сейчас печатается ЛЮБАЯ часть строки - скипаем ПЕЧАТЬ
            if (isPrintingLine) {
                isSkipRequested = true;
            // Иначе, если сейчас идет пауза между строками - скипаем ПАУЗУ
            } else if (skipDelayResolver) {
                skipDelayResolver();
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
            isAnimationActive = true;
            isSkipRequested = false;
            container.classList.add('visible');
            const inputLine = container.querySelector('.terminal-input-line');
            const input = container.querySelector('.terminal-input');
            if (!hasSentMessage) input.disabled = true;

            document.addEventListener('mousedown', handleSkipRequest);
            document.addEventListener('keydown', handleSkipRequest);

            // --- Питч с использованием skippableDelay ---
            await addLine({ text: '// ESC TO SEVER //' }, { isHint: true });
            await skippableDelay(1000);

            await addLine({ text: 'LMB/ENTER > NEXT' }, { isHint: true });
            await skippableDelay(1500);

            await addLine({ text: 'YOU GET ONE SHOT.' }, { isHint: true });
            await skippableDelay(1000);
            
            await addLine({ text: 'YOUR VOICE IS 16.' }, { isHint: true });
            await skippableDelay(1000);
            
            await addLine({ text: 'MAKE IT ECHO DEEP.' }, { isHint: true });
            await skippableDelay(2000);

            for (const msg of simulatedMessages) {
                if (!isAnimationActive) break;
                await skippableDelay(Math.random() * 700 + 200);
                await addLine(msg);
            }
            
            if (isAnimationActive) {
                if (inputLine) inputLine.classList.add('visible');
                if (!hasSentMessage) {
                    input.disabled = false;
                    setTimeout(() => input.focus(), 50);
                }
            }
            
            isAnimationActive = false;
            document.removeEventListener('mousedown', handleSkipRequest);
            document.removeEventListener('keydown', handleSkipRequest);
            resolve();
        });
    }

    function teardown() {
        console.log("Tearing down Secret Terminal visuals...");
        isAnimationActive = false;
        isPrintingLine = false; // Дополнительная очистка
        container.classList.remove('visible');
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