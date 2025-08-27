// assets/js/ui/secretTerminal.js

function getSecretTerminalHandlers() {
    const container = document.getElementById('secret-terminal-container');
    if (!container) return {};

    const TEST_MODE = true;
    const MAX_CHARS = 16;
    const STORAGE_KEY = 'secretTerminalMessageSent';
    // В тестовом режиме используем sessionStorage (сбрасывается при закрытии вкладки), иначе - localStorage (постоянное).
    const storage = TEST_MODE ? sessionStorage : localStorage;

    // --- Переменные состояния ---
    let outputEl, trackEl, thumbEl; // Элементы DOM
    let isAnimationActive, isPrintingLine, isSkipRequested, skipDelayResolver, username, hasSentMessage,
        isDraggingScrollbar, dragStartY;

    // --- ФУНКЦИЯ ПОЛНОГО СБРОСА И ОЧИСТКИ ---
    function resetState() {
        console.log("--- Resetting Secret Terminal state variables. ---");
        isAnimationActive = false;
        isPrintingLine = false;
        isSkipRequested = false;
        skipDelayResolver = null;
        hasSentMessage = storage.getItem(STORAGE_KEY) === 'true';
        username = `User-${Math.random().toString(16).substr(2, 4).toUpperCase()}`;
        isDraggingScrollbar = false;
        dragStartY = 0;
    }

    const simulatedMessages = [
        { name: 'User-BEEF', text: 'Anyone listening?' },
        { name: 'User-C0DE', text: 'Hello, void.' },
        { name: 'User-1337', text: 'I was here. -J' },
        { name: 'User-NULL', text: 'Is this the end?' },
        { name: 'User-FEED', text: 'Or the beginning?' },
        { name: 'User-4EVA', text: 'Just a whisper.' },
        { name: 'User-ECHO', text: 'Repeating signal.' },
        { name: 'User-ROOT', text: 'Who is SysOp?' },
        { name: 'User-BYTE', text: 'Lost my password.' },
        { name: 'User-GLCH', text: '16 is not enough!' },
        { name: 'User-BEEF', text: 'Still here.' },
        { name: 'User-HACK', text: 'Trying to break.' },
        { name: 'User-A5C1', text: 'Only memories.' },
        { name: 'User-B1N0', text: '0110100001101001' }, // "hi" in binary
        { name: 'User-DEAD', text: '...' },
        { name: 'User-ECHO', text: 'Repeating signal.' },
        { name: 'User-ROOT', text: 'Who is SysOp?' },
        { name: 'User-BYTE', text: 'Lost my password.' },
        { name: 'User-GLCH', text: '16 is not enough!' },
        { name: 'User-BEEF', text: 'Still here.' },
        { name: 'User-HACK', text: 'Trying to break.' },
        { name: 'User-A5C1', text: 'Only memories.' },
        { name: 'User-B1N0', text: '0110100001101001' }, // "hi" in binary
        { name: 'User-DEAD', text: '...' },
        { name: 'User-ECHO', text: 'Repeating signal.' },
        { name: 'User-ROOT', text: 'Who is SysOp?' },
        { name: 'User-BYTE', text: 'Lost my password.' },
        { name: 'User-GLCH', text: '16 is not enough!' },
        { name: 'User-BEEF', text: 'Still here.' },
        { name: 'User-HACK', text: 'Trying to break.' },
        { name: 'User-A5C1', text: 'Only memories.' },
        { name: 'User-B1N0', text: '0110100001101001' }, // "hi" in binary
        { name: 'User-DEAD', text: '...' }
    ];
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
    
    function updateCustomScrollbar() {
        if (!outputEl || !trackEl || !thumbEl) return;

        const scrollableHeight = outputEl.scrollHeight;
        const visibleHeight = outputEl.clientHeight;

        if (scrollableHeight > visibleHeight) {
            trackEl.classList.add('visible');
        } else {
            trackEl.classList.remove('visible');
        }

        const thumbHeight = (visibleHeight / scrollableHeight) * 100;
        thumbEl.style.height = `${thumbHeight}%`;

        // Если мы перетаскиваем, позиция уже контролируется функцией handleDrag
        if (isDraggingScrollbar) return;

        const scrollPercentage = outputEl.scrollTop / (scrollableHeight - visibleHeight);
        const thumbPosition = scrollPercentage * (100 - thumbHeight);
        thumbEl.style.top = `${thumbPosition}%`;
    }

    const handleDrag = (e) => {
        if (!isDraggingScrollbar) return;
        e.preventDefault();

        const trackRect = trackEl.getBoundingClientRect();
        const thumbHeight = thumbEl.getBoundingClientRect().height;

        // 1. Рассчитываем новую позицию верха ползунка в пикселях
        let newTopPx = e.clientY - trackRect.top - dragStartY;

        // 2. Ограничиваем движение в пределах дорожки
        const maxTopPx = trackRect.height - thumbHeight;
        newTopPx = Math.max(0, Math.min(newTopPx, maxTopPx));

        // 3. Конвертируем позицию в проценты
        const scrollableTrackHeight = trackRect.height - thumbHeight;
        const scrollPercentage = scrollableTrackHeight > 0 ? newTopPx / scrollableTrackHeight : 0;
        
        // 4. Используем этот процент как ЕДИНЫЙ источник истины
        const newThumbTopPercent = scrollPercentage * (100 - (thumbHeight / trackRect.height * 100));
        thumbEl.style.top = `${newThumbTopPercent}%`;
        
        const contentScrollableHeight = outputEl.scrollHeight - outputEl.clientHeight;
        outputEl.scrollTop = scrollPercentage * contentScrollableHeight;
    };

    const stopDrag = () => {
        if (!isDraggingScrollbar) return;
        isDraggingScrollbar = false;
        document.body.classList.remove('is-terminal-scrolling');

        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
    };

    const startDrag = (e) => {
        // Игнорируем клики, если скроллбар не виден
        if (!trackEl.classList.contains('visible')) return;
        
        e.preventDefault();
        e.stopPropagation();
        isDraggingScrollbar = true;
        document.body.classList.add('is-terminal-scrolling');

        dragStartY = e.clientY - thumbEl.getBoundingClientRect().top;

        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
    };

    async function addLine(msg, options = {}) {
        const { isUser = false, isHint = false } = options;
        if (!isAnimationActive) return;
    
        isPrintingLine = true;
        
        // Используем глобальную переменную outputEl, определенную в prepareSecretTerminal
        if (!outputEl) { 
            isPrintingLine = false;
            return;
        }
    
        // --- ЛОГИКА "УМНОЙ" ПРОКРУТКИ ---
        // 1. Проверяем, находится ли пользователь в самом низу ПЕРЕД добавлением нового контента.
        const isScrolledToBottom = Math.abs(outputEl.scrollHeight - outputEl.scrollTop - outputEl.clientHeight) < 5;
        
        // Создаем DOM-элементы
        const lineEl = document.createElement('div');
        lineEl.className = 'terminal-line';
        if (isUser) lineEl.classList.add('is-user-message');
        if (isHint) lineEl.classList.add('is-hint-line');
    
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
        
        outputEl.appendChild(lineEl);
    
        // 2. Если пользователь БЫЛ внизу, прокручиваем к новому концу.
        if (isScrolledToBottom) {
            outputEl.scrollTop = outputEl.scrollHeight;
        }
        
        // 3. Обновляем наш кастомный скроллбар после добавления контента.
        updateCustomScrollbar();
        
        setTimeout(() => lineEl.classList.add('visible'), 10);
        await delay(50);
        if (!isAnimationActive) return;
    
        await typeContent(counterEl, `[${msg.text.length}]`);
        if (!isHint) {
            await typeContent(lineEl.querySelector('.username'), `${msg.name}>`);
        }
        await typeContent(textEl, msg.text);
    
        isPrintingLine = false;
        isSkipRequested = false;
    }

    function updateCharCounter(inputElement) {
        const counter = container.querySelector('.char-counter');
        if (!counter) return;
        const remaining = MAX_CHARS - inputElement.value.length;
        counter.textContent = `[${remaining}]`;
    }

    function lockInput(inputElement) {
        inputElement.disabled = true;
        inputElement.value = '';
        const prompt = container.querySelector('.terminal-prompt');
        if (prompt) prompt.textContent = 'TRANSMISSION LOCKED>';
        const counter = container.querySelector('.char-counter');
        if(counter) counter.textContent = '[LOCKED]';
    }

    async function handleUserInput(inputElement) {
        if (isPrintingLine || hasSentMessage) return;
        const text = inputElement.value.trim();
        if (text) {
            hasSentMessage = true;
            lockInput(inputElement);
            if (!TEST_MODE) {
                storage.setItem(STORAGE_KEY, 'true');
            }
            isAnimationActive = true;
            await addLine({ name: username, text: text }, { isUser: true });
            isAnimationActive = false;
        }
    }

    const handleSkipRequest = (e) => {
        if (e.type === 'mousedown' || e.key === 'Enter') {
            e.preventDefault();
            if (isPrintingLine) {
                isSkipRequested = true;
            } else if (skipDelayResolver) {
                skipDelayResolver();
            }
        }
    };

    const handleImmediateExit = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault(); e.stopPropagation();
            if (window.actionHandler) { window.actionHandler.trigger(); }
        }
    };

    function prepareSecretTerminal() {
        resetState();
        
        // --- НОВАЯ HTML-СТРУКТУРА ---
        container.innerHTML = `
            <div class="terminal-output-wrapper">
                <div class="terminal-output"></div>
            </div>
            <div class="custom-scrollbar-track">
                <div class="custom-scrollbar-thumb"></div>
            </div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">${username}></span>
                <input type="text" class="terminal-input" maxlength="${MAX_CHARS}" />
                <div class="input-suffix">
                    <span class="char-counter">[${MAX_CHARS}]</span>
                    <div class="terminal-cursor"></div>
                </div>
            </div>
        `;
        
        // Находим и сохраняем элементы в глобальные переменные модуля
        outputEl = container.querySelector('.terminal-output');
        trackEl = container.querySelector('.custom-scrollbar-track');
        thumbEl = container.querySelector('.custom-scrollbar-thumb');

        // Вешаем слушатели
        outputEl.addEventListener('scroll', updateCustomScrollbar);
        thumbEl.style.pointerEvents = 'auto'; // Делаем ползунок кликабельным
        thumbEl.addEventListener('mousedown', startDrag);
        
        const input = container.querySelector('.terminal-input');
        input.addEventListener('keydown', async (e) => { if (e.key === 'Enter') await handleUserInput(input); });
        input.addEventListener('input', () => updateCharCounter(input));
        
        if (hasSentMessage) {
            lockInput(input);
        }
    }

    function activateSecretTerminal() {
        return new Promise(async (resolve) => {
            isAnimationActive = true;
            container.classList.add('visible');
            const inputLine = container.querySelector('.terminal-input-line');
            const input = container.querySelector('.terminal-input');
            if (!hasSentMessage) input.disabled = true;

            document.addEventListener('mousedown', handleSkipRequest);
            document.addEventListener('keydown', handleSkipRequest);
            document.addEventListener('keydown', handleImmediateExit);

            await addLine({ text: '// ESC TO SEVER //' }, { isHint: true });
            if (!isAnimationActive) return resolve();
            await skippableDelay(1000);
            if (!isAnimationActive) return resolve();
            await addLine({ text: 'LMB/ENTER > NEXT' }, { isHint: true });
            if (!isAnimationActive) return resolve();
            await skippableDelay(1500);
            if (!isAnimationActive) return resolve();
            await addLine({ text: 'YOU GET ONE SHOT.' }, { isHint: true });
            if (!isAnimationActive) return resolve();
            await skippableDelay(1000);
            if (!isAnimationActive) return resolve();
            await addLine({ text: 'YOUR VOICE IS 16.' }, { isHint: true });
            if (!isAnimationActive) return resolve();
            await skippableDelay(1000);
            if (!isAnimationActive) return resolve();
            await addLine({ text: 'MAKE IT ECHO DEEP.' }, { isHint: true });
            if (!isAnimationActive) return resolve();
            await skippableDelay(2000);
            if (!isAnimationActive) return resolve();

            for (const msg of simulatedMessages) {
                if (!isAnimationActive) break;
                await skippableDelay(Math.random() * 700 + 200);
                if (!isAnimationActive) break;
                await addLine(msg);
            }

            updateCustomScrollbar();
            
            if (isAnimationActive) {
                document.removeEventListener('mousedown', handleSkipRequest);
                document.removeEventListener('keydown', handleSkipRequest);
                document.removeEventListener('keydown', handleImmediateExit);
                
                if (inputLine) inputLine.classList.add('visible');
                if (!hasSentMessage) {
                    input.disabled = false;
                    setTimeout(() => input.focus(), 50);
                }
            }
            isAnimationActive = false;
            resolve();
        });
    }
    
    function teardown() { // ИЛИ onExit
        return new Promise(resolve => {
            console.log("--- Tearing down Secret Terminal: Halting logic and starting fade-out. ---");
            isAnimationActive = false;
            
            // --- ОЧИСТКА СЛУШАТЕЛЕЙ ---
            if (outputEl) outputEl.removeEventListener('scroll', updateCustomScrollbar);
            if (thumbEl) thumbEl.removeEventListener('mousedown', startDrag);
            // Принудительно завершаем перетаскивание, если оно было активно
            stopDrag(); 

            document.removeEventListener('mousedown', handleSkipRequest);
            document.removeEventListener('keydown', handleSkipRequest);
            document.removeEventListener('keydown', handleImmediateExit);

            const allVisibleContent = container.querySelectorAll('.terminal-line.visible, .terminal-input-line.visible, .custom-scrollbar-track.visible');
            
            if (allVisibleContent.length > 0) {
                allVisibleContent.forEach(el => el.classList.remove('visible'));
                setTimeout(() => {
                    container.classList.remove('visible');
                    resolve();
                }, 500);
            } else {
                container.classList.remove('visible');
                resolve();
            }
        });
    }

    function cleanup() {
        console.log("Cleaning up Secret Terminal DOM and resetting state for next session.");
        container.innerHTML = '';
        resetState();
    }

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
        borderVarPrefix: 'terminal',
        keepCursorVisible: true
    };
}