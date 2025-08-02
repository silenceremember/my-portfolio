// assets/js/game/ui/prompts.js

/**
 * Создает DOM-элемент для стартовой подсказки.
 */
function createStartPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'game-start-prompt';

    prompt.innerHTML = `
        <div class="prompt-section">
            <div class="prompt-title" data-prompt-enemy="title">УПРАВЛЕНИЕ</div>
            <div class="prompt-keys-wrapper">
                <!-- WASD Keys (текст) -->
                <div class="key-group-wasd">
                    <div class="prompt-key key-w" data-prompt-enemy="key">W</div>
                    <div class="prompt-key key-a" data-prompt-enemy="key">A</div>
                    <div class="prompt-key key-s" data-prompt-enemy="key">S</div>
                    <div class="prompt-key key-d" data-prompt-enemy="key">D</div>
                </div>
                <!-- Arrow Keys (SVG из общей библиотеки) -->
                <div class="key-group-arrows">
                    <div class="prompt-key key-up" data-prompt-enemy="key">
                        <div class="icon-container prompt-arrow-icon vertical">${SVGLibrary.arrowUp}</div>
                    </div>
                    <div class="prompt-key key-left" data-prompt-enemy="key">
                         <div class="icon-container prompt-arrow-icon horizontal">${SVGLibrary.arrowLeft}</div>
                    </div>
                    <div class="prompt-key key-down" data-prompt-enemy="key">
                         <div class="icon-container prompt-arrow-icon vertical">${SVGLibrary.arrowDown}</div>
                    </div>
                    <div class="prompt-key key-right" data-prompt-enemy="key">
                         <div class="icon-container prompt-arrow-icon horizontal">${SVGLibrary.arrowRight}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="prompt-section">
            <div class="prompt-title" data-prompt-enemy="title">ВЫХОД</div>
            <div class="prompt-key key-esc" data-prompt-enemy="key">ESC</div>
        </div>
    `;
    
    document.body.appendChild(prompt);
    return prompt;
}