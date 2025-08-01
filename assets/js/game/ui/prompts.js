// assets/js/game/ui/prompts.js

function createStartPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'game-start-prompt';
    prompt.innerHTML = `<p><kbd>WASD</kbd> - Движение</p><p><kbd>ESC</kbd> - Выход</p>`;
    document.body.appendChild(prompt);
    return prompt;
}