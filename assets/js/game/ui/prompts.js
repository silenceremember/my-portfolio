// assets/js/game/ui/prompts.js

/**
 * Создает DOM-элемент для стартовой подсказки, комбинируя текст и SVG-иконки.
 * Каждый элемент получает data-атрибут `data-prompt-enemy`, чтобы в будущем стать врагом.
 */
function createStartPrompt() {
    if (typeof GameIcons === 'undefined') {
        console.error('GameIcons is not loaded.');
        return;
    }

    const prompt = document.createElement('div');
    prompt.className = 'game-start-prompt';

    prompt.innerHTML = `
        <div class="prompt-section">
            <div class="prompt-title control" data-prompt-enemy="title">УПРАВЛЕНИЕ</div>
            <div class="prompt-keys-wrapper">
                <!-- WASD Keys (SVG без рамок) -->
                <div class="key-group-wasd">
                    <div class="prompt-key key-w" data-prompt-enemy="key">${GameIcons.keyW}</div>
                    <div class="prompt-key key-a" data-prompt-enemy="key">${GameIcons.keyA}</div>
                    <div class="prompt-key key-s" data-prompt-enemy="key">${GameIcons.keyS}</div>
                    <div class="prompt-key key-d" data-prompt-enemy="key">${GameIcons.keyD}</div>
                </div>
                <!-- Arrow Keys (SVG без рамок) -->
                <div class="key-group-arrows">
                    <div class="prompt-key key-up" data-prompt-enemy="key">${GameIcons.arrowUp}</div>
                    <div class="prompt-key key-left" data-prompt-enemy="key">${GameIcons.arrowLeft}</div>
                    <div class="prompt-key key-down" data-prompt-enemy="key">${GameIcons.arrowDown}</div>
                    <div class="prompt-key key-right" data-prompt-enemy="key">${GameIcons.arrowRight}</div>
                </div>
            </div>
        </div>
        
        <div class="prompt-section">
            <div class="prompt-title exit" data-prompt-enemy="title">ВЫХОД</div>
            <div class="prompt-key key-esc" data-prompt-enemy="key">ESC</div>
        </div>
    `;
    
    document.body.appendChild(prompt);
    return prompt;
}