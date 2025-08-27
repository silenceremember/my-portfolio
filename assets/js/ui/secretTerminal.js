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
    let outputEl, trackEl, thumbEl, holdProgressBarEl,
        // ДОБАВЛЯЕМ ПЕРЕМЕННУЮ ДЛЯ ЭЛЕМЕНТА ВВОДА
        inputEl; 
    let isAnimationActive, isPrintingLine, isSkipRequested, skipDelayResolver, username, hasSentMessage,
        isDraggingScrollbar, dragStartY,
        // ОБНОВЛЕННЫЕ ПЕРЕМЕННЫЕ
        isHoldingSkip, holdSuccessTimer, holdAppearanceTimer, holdStartTime, bulkLoadTriggered; 

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
        isHoldingSkip = false;
        holdSuccessTimer = null; // Основной таймер на 1 сек
        holdAppearanceTimer = null; // Таймер на появление (0.3 сек)
        holdStartTime = 0;
        inputEl = null; // Сбрасываем и ссылку на элемент
        bulkLoadTriggered = false;
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

    const handleDocumentClick = (e) => {
        // Защита: выходим, если инпут не готов к работе
        if (!inputEl || inputEl.disabled) {
            return;
        }

        const target = e.target;
        
        // Проверяем, был ли клик по элементам, которые НЕ должны вызывать фокус
        const isInteractiveTerminalElement = 
            target === inputEl || // Сам инпут
            target === thumbEl;   // Ползунок скроллбара

        if (!isInteractiveTerminalElement) {
            // Если клик был НЕ по интерактивному элементу,
            // мы принудительно возвращаем фокус.
            e.preventDefault(); // Предотвращаем любые другие действия (например, выделение текста на фоне)
            inputEl.focus();
        }
    };

    const handleInputBlur = () => {
        if (window.systemState !== 'TERMINAL_ACTIVE') return;
        setTimeout(() => {
            if (inputEl && !inputEl.disabled) {
                inputEl.focus();
            }
        }, 0);
    };

    const handleGlobalInput = (e) => {
        // Защита: выходим, если поле ввода не готово, невидимо или заблокировано
        if (!inputEl || inputEl.disabled || hasSentMessage) {
            return;
        }

        if ((e.metaKey || e.ctrlKey) && e.key !== 'Control' && e.key !== 'Meta') {
            // Особенно жестко блокируем Ctrl+V
            if (e.key === 'v' || e.key === 'V') {
                e.preventDefault(); // Отменяем стандартное действие вставки
                console.log('Paste via Ctrl+V blocked.');
            }
            // Мы можем либо просто выйти, либо разрешить некоторые комбинации,
            // но для максимальной "честности" лучше просто выйти.
            return;
        }

        if (isHoldingSkip && (e.code === 'Space' || e.key === 'Enter')) {
            return;
        }

        e.preventDefault();

        if (e.key === 'Enter') {
            handleUserInput(inputEl);
        } else if (e.key === 'Backspace') {
            inputEl.value = inputEl.value.slice(0, -1);
            updateCharCounter(inputEl);
        } else if (e.key.length === 1) { // Проверяем, что это печатный символ
            // --- НОВАЯ ЗАЩИТА №1: ПРОВЕРКА НА ПРОБЕЛ В НАЧАЛЕ ---
            const isSpace = e.key === ' ';
            const isEmpty = inputEl.value.length === 0;

            // Запрещаем ввод пробела, если поле пустое
            if (isSpace && isEmpty) {
                return; // Просто выходим, ничего не делая
            }
            
            if (inputEl.value.length < MAX_CHARS) {
                inputEl.value += e.key;
                updateCharCounter(inputEl);
            }
        }
    };

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
        const { isUser = false, isHint = false, instant = false } = options;
        if (!isAnimationActive && !instant) return;
    
        isPrintingLine = true;
        
        if (!outputEl) { 
            isPrintingLine = false;
            return;
        }
    
        const isScrolledToBottom = Math.abs(outputEl.scrollHeight - outputEl.scrollTop - outputEl.clientHeight) < 5;
        
        // Создаем DOM-элементы
        const lineEl = document.createElement('div');
        lineEl.className = 'terminal-line';
        if (isUser) lineEl.classList.add('is-user-message');
        if (isHint) lineEl.classList.add('is-hint-line');
    
        const counterEl = document.createElement('span');
        counterEl.className = 'message-char-counter';
        
        // === ИЗМЕНЕНИЕ №1: Создаем textEl один раз ===
        const textEl = document.createElement('span');
        textEl.className = 'text';
    
        let userEl; // Объявляем userEl здесь, чтобы он был доступен ниже
    
        if (isHint) {
            lineEl.append(counterEl, textEl);
        } else {
            userEl = document.createElement('span'); // Присваиваем значение, а не объявляем заново
            userEl.className = 'username';
            lineEl.append(counterEl, userEl, textEl);
        }
        
        outputEl.appendChild(lineEl);
    
        if (isScrolledToBottom) {
            outputEl.scrollTop = outputEl.scrollHeight;
        }
        
        updateCustomScrollbar();
        
        setTimeout(() => lineEl.classList.add('visible'), 10);
        // Для мгновенной загрузки не нужна пауза
        if (!instant) {
            await delay(50);
        }
        if (!isAnimationActive && !instant) return;
    
        // --- Логика вывода текста ---
        if (instant) {
            counterEl.textContent = `[${msg.text.length}]`;
        } else {
            await typeContent(counterEl, `[${msg.text.length}]`);
        }
    
        if (!isHint) {
            // Используем переменную userEl, которую мы уже создали
            if (instant) {
                userEl.textContent = `${msg.name}>`;
            } else {
                await typeContent(userEl, `${msg.name}>`);
            }
        }
        
        // === ИЗМЕНЕНИЕ №2: Убираем повторное объявление textEl ===
        // Просто используем уже существующую переменную textEl
        if (instant) {
            textEl.textContent = msg.text;
        } else {
            await typeContent(textEl, msg.text);
        }
    
        isPrintingLine = false;
        if (!instant) {
            isSkipRequested = false;
        }
    }

    const onHoldSuccess = () => {
        // Проверяем, что мы все еще в состоянии удержания
        if (!isHoldingSkip) return;
    
        console.log("Hold success! Triggering bulk load.");
        
        // 1. Устанавливаем флаги, которые будут прочитаны в основном цикле
        bulkLoadTriggered = true;
        isSkipRequested = true; // Этот флаг заставит ЛЮБУЮ ТЕКУЩУЮ анимацию typeContent завершиться
    
        // 2. Прерываем любую ТЕКУЩУЮ паузу skippableDelay
        if (skipDelayResolver) {
            skipDelayResolver();
        }
    
        // 3. Сбрасываем UI и состояние удержания.
        // Флаг bulkLoadTriggered остается true до конца анимации.
        isHoldingSkip = false;

        // Вместо мгновенного скрытия, делаем так же, как в cancelHoldSkip
        holdProgressBarEl.classList.remove('is-filling');
        holdProgressBarEl.querySelector('.hold-skip-progress-bar__fill').style.width = '0%';
        setTimeout(() => {
            holdProgressBarEl.classList.remove('visible');
        }, 300);
    };

    const startHoldSkip = (e) => {
        // --- НОВАЯ, УСИЛЕННАЯ ПРОВЕРКА ---
        // Теперь функция реагирует ТОЛЬКО на событие mousedown (клик мыши).
        if (e.type !== 'mousedown') {
            return;
        }

        // --- Усиленная защитная проверка (Guard Clause) ---
        // Выходим из функции, если выполняется ЛЮБОЕ из этих условий:
        if (
            // 1. Процесс удержания уже запущен
            isHoldingSkip ||
            
            // 2. Анимация в терминале неактивна
            !isAnimationActive ||
            
            // 3. Это клик мыши, но не левой кнопкой
            (e.type === 'mousedown' && e.button !== 0)
        ) {
            return; // Прерываем выполнение функции
        }
        
        // --- Начало логики удержания ---
        isHoldingSkip = true;
        holdStartTime = performance.now();
        
        holdAppearanceTimer = setTimeout(() => {
            holdProgressBarEl.classList.add('visible', 'is-filling');
            const fillEl = holdProgressBarEl.querySelector('.hold-skip-progress-bar__fill');
            setTimeout(() => { fillEl.style.width = '100%'; }, 10);
            holdSuccessTimer = setTimeout(onHoldSuccess, 1050);
        }, 300);
    };


    const cancelHoldSkip = (e) => {
        // --- НОВАЯ ПРОВЕРКА ---
        // Убеждаемся, что мы не пытаемся обработать событие keyup, которое больше не релевантно.
        // Мы можем либо проверять e.type, либо просто убрать 'e' из аргументов,
        // так как теперь эта функция вызывается без события от клавиатуры.
        // Оставим проверку для надежности.
        if (e && e.type === 'keyup') {
            return;
        }

        if (!isHoldingSkip) return;
    
        const holdDuration = performance.now() - holdStartTime;
    
        clearTimeout(holdAppearanceTimer);
        clearTimeout(holdSuccessTimer);
        isHoldingSkip = false;
        
        holdProgressBarEl.classList.remove('is-filling');
        const fillEl = holdProgressBarEl.querySelector('.hold-skip-progress-bar__fill');
        fillEl.style.width = '0%';
        setTimeout(() => {
            holdProgressBarEl.classList.remove('visible');
        }, 300);
        
        // Логика для быстрого клика (tap) остается прежней
        if (holdDuration < 250) { 
            console.log("Tap detected. Skipping one line/delay.");
            if (isPrintingLine) {
                isSkipRequested = true;
            } else if (skipDelayResolver) {
                skipDelayResolver();
            }
        }
    };

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

    // --- НОВЫЙ ИМЕНОВАННЫЙ ОБРАБОТЧИК ДЛЯ KEYDOWN ---
    const handleHoldKeydown = (e) => {
        // Проверяем обе клавиши
        if (e.key === 'Enter' || e.code === 'Space') {
            startHoldSkip(e);
        }
    };
    // --- НОВЫЙ ИМЕНОВАННЫЙ ОБРАБОТЧИК ДЛЯ KEYUP ---
    const handleHoldKeyup = (e) => {
        // Проверяем обе клавиши
        if (e.key === 'Enter' || e.code === 'Space') {
            cancelHoldSkip(e);
        }
    };

    const handleImmediateExit = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault(); e.stopPropagation();
            if (window.actionHandler) { window.actionHandler.trigger(); }
        }
    };

    async function handleUserInput(inputElement) {
        // Убрали проверку `isPrintingLine`, так как к моменту, когда пользователь может вводить,
        // печать уже точно завершена.
        if (hasSentMessage) return;

        // --- НОВАЯ ЗАЩИТА №1: TRIM ПЕРЕД ОТПРАВКОЙ ---
        // Обрезаем пробелы с начала и конца строки
        const text = inputElement.value.trim();
        
        // Отправляем только если после обрезки что-то осталось
        if (text) {
            hasSentMessage = true;
            // Важно: обновляем значение в поле ввода на обрезанное,
            // чтобы пользователь видел, что пробелы удалились.
            inputElement.value = text; 
            updateCharCounter(inputElement); // И обновляем счетчик

            lockInput(inputElement);
            if (!TEST_MODE) {
                storage.setItem(STORAGE_KEY, 'true');
            }
            isAnimationActive = true; // Этот флаг здесь не так важен, но пусть будет для консистентности
            await addLine({ name: username, text: text }, { isUser: true });
            isAnimationActive = false;
        } else {
            // Если после trim строка стала пустой, просто очищаем поле ввода.
            inputElement.value = '';
            updateCharCounter(inputElement);
        }
    }

    const preventDefaultAction = (e) => e.preventDefault();

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
            <div class="hold-skip-progress-bar">
                <div class="hold-skip-progress-bar__fill"></div>
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
        holdProgressBarEl = container.querySelector('.hold-skip-progress-bar');
        
        // Сохраняем ссылку на инпут в переменную модуля
        inputEl = container.querySelector('.terminal-input'); 

        // Вешаем слушатели
        outputEl.addEventListener('scroll', updateCustomScrollbar);
        thumbEl.addEventListener('mousedown', startDrag);
        inputEl.addEventListener('input', () => updateCharCounter(inputEl));
        
        // --- ДОБАВЛЯЕМ НОВЫЕ СЛУШАТЕЛИ ---
        inputEl.addEventListener('blur', handleInputBlur);
        inputEl.addEventListener('paste', preventDefaultAction);
        inputEl.addEventListener('drop', preventDefaultAction);
        inputEl.addEventListener('contextmenu', preventDefaultAction);

        if (hasSentMessage) {
            lockInput(inputEl);
        }
    }

    function activateSecretTerminal() {
        return new Promise(async (resolve) => {
            isAnimationActive = true;
            container.classList.add('visible');
            const inputLine = container.querySelector('.terminal-input-line');
            // УДАЛЯЕМ эту строку, так как inputEl уже определен в prepareSecretTerminal
            // const input = container.querySelector('.terminal-input'); 
            if (!hasSentMessage) inputEl.disabled = true;
    
            // Добавляем слушатели
            document.addEventListener('mousedown', startHoldSkip);
            // document.addEventListener('keydown', handleHoldKeydown); // <-- УДАЛЯЕМ
            document.addEventListener('mouseup', cancelHoldSkip);

            // document.addEventListener('keyup', handleHoldKeyup);     // <-- УДАЛЯЕМ
            window.addEventListener('blur', cancelHoldSkip); // Этот оставляем, он полезен
            document.addEventListener('keydown', handleImmediateExit);
    
            // --- ШАГ 1: Создаем единый сценарий для ВСЕГО контента ---
            const allContentSteps = [];
            
            // Вспомогательная функция для чистоты кода
            const addStep = (type, data) => allContentSteps.push({ type, data });
    
            // Добавляем интро-подсказки в сценарий
            addStep('line', { msg: { text: '// ESC TO SEVER //' }, options: { isHint: true } });
            addStep('delay', { ms: 1000 });
            addStep('line', { msg: { text: 'LMB/ENTER > NEXT' }, options: { isHint: true } });
            addStep('delay', { ms: 1500 });
            addStep('line', { msg: { text: 'YOU GET ONE SHOT.' }, options: { isHint: true } });
            addStep('delay', { ms: 1000 });
            addStep('line', { msg: { text: 'YOUR VOICE IS 16.' }, options: { isHint: true } });
            addStep('delay', { ms: 1000 });
            addStep('line', { msg: { text: 'MAKE IT ECHO DEEP.' }, options: { isHint: true } });
            addStep('delay', { ms: 2000 });
    
            // Добавляем основные сообщения в сценарий
            simulatedMessages.forEach(msg => {
                addStep('delay', { ms: Math.random() * 700 + 200 });
                addStep('line', { msg: msg, options: {} });
            });
    
            // --- ШАГ 2: Запускаем единый цикл выполнения сценария ---
            for (let i = 0; i < allContentSteps.length; i++) {
                const step = allContentSteps[i];
    
                // Проверяем флаг в начале каждой итерации
                if (bulkLoadTriggered) {
                    console.log(`Bulk load triggered. Instantly finishing from step ${i}.`);
                    // Если флаг установлен, переключаемся в режим мгновенного вывода
                    const remainingSteps = allContentSteps.slice(i);
                    for (const remainingStep of remainingSteps) {
                        // Мгновенно выводим только строки, пропуская все задержки
                        if (remainingStep.type === 'line') {
                            // Объединяем опции из сценария с флагом instant: true
                            const finalOptions = { ...remainingStep.data.options, instant: true };
                            await addLine(remainingStep.data.msg, finalOptions);
                        }
                    }
                    // Завершаем основной цикл, так как все уже выведено
                    break;
                }
    
                // Если мы здесь, значит, bulkLoad не активен. Выполняем шаг в обычном режиме.
                if (!isAnimationActive) break; // Проверка на выход по ESC
    
                if (step.type === 'line') {
                    await addLine(step.data.msg, step.data.options);
                } else if (step.type === 'delay') {
                    await skippableDelay(step.data.ms);
                }
            }
            
            // --- ШАГ 3: Завершение и очистка ---
            updateCustomScrollbar();
            
            if (isAnimationActive) {
                // Убираем слушатели, которые больше не нужны
                document.removeEventListener('mousedown', startHoldSkip);
                // document.removeEventListener('keydown', handleHoldKeydown); // <-- УДАЛЯЕМ
                document.removeEventListener('mouseup', cancelHoldSkip);
                // document.removeEventListener('keyup', handleHoldKeyup);     // <-- УДАЛЯЕМ
                window.removeEventListener('blur', cancelHoldSkip);
                
                if (inputLine) inputLine.classList.add('visible');

                if (!hasSentMessage) {
                    inputEl.disabled = false;
                    document.addEventListener('keydown', handleGlobalInput);
                    
                    // --- ДОБАВЛЯЕМ ГЛОБАЛЬНЫЙ СЛУШАТЕЛЬ КЛИКОВ ---
                    document.addEventListener('click', handleDocumentClick, true); // Используем `true` для фазы захвата

                    setTimeout(() => inputEl.focus(), 50);
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
            
            // --- ОЧИСТКА ВСЕХ СЛУШАТЕЛЕЙ ---
            if (outputEl) outputEl.removeEventListener('scroll', updateCustomScrollbar);
            if (thumbEl) thumbEl.removeEventListener('mousedown', startDrag);
            stopDrag(); 

            cancelHoldSkip(); // Завершаем удержание, если оно было активно
            document.removeEventListener('mousedown', startHoldSkip);
            // document.removeEventListener('keydown', handleHoldKeydown); // <-- УДАЛЯЕМ
            document.removeEventListener('mouseup', cancelHoldSkip);
            // document.removeEventListener('keyup', handleHoldKeyup);     // <-- УДАЛЯЕМ
            window.removeEventListener('blur', cancelHoldSkip);
            document.removeEventListener('keydown', handleImmediateExit);

            // --- ОБЯЗАТЕЛЬНО УДАЛЯЕМ НОВЫЕ СЛУШАТЕЛИ ---
            document.removeEventListener('click', handleDocumentClick, true);
            if (inputEl) {
                inputEl.removeEventListener('blur', handleInputBlur);
                inputEl.removeEventListener('paste', preventDefaultAction);
                inputEl.removeEventListener('drop', preventDefaultAction);
                inputEl.removeEventListener('contextmenu', preventDefaultAction);
            }

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