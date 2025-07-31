// assets/js/game/enemy.js

function loadLevel(levelIndex) {
    const section = document.querySelector(`[data-section-id="${levelIndex}"]`);
    if (!section) return;
    const waveConfig = [
        { selector: 'h1', delay: 500, hp: 6 },
        { selector: '.nickname', delay: 1200, hp: 6 },
        { selector: '.profession-line > *', delay: 2000, hp: 3 },
        { selector: '.philosophy', delay: 3000, hp: 1 },
        { selector: '[data-destroyable="boss-part"]', delay: 5000, hp: 100 }
    ];
    section.style.visibility = 'visible';
    section.style.opacity = '1';
    section.style.display = 'flex';
    waveConfig.forEach(config => {
        const elements = section.querySelectorAll(config.selector);
        elements.forEach((el, index) => {
            const spawnDelay = config.delay + (index * 200);
            setTimeout(() => { createEnemiesFromElement(el, config.hp); }, spawnDelay);
        });
    });
    setTimeout(() => {
        section.style.visibility = 'hidden';
        section.style.opacity = '0';
        section.style.pointerEvents = 'none';
    }, 100);
}

function createEnemiesFromElement(element, hp) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const isText = (element.textContent.trim().length > 0 && !element.matches('.hero-photo-placeholder, .separator-icon-large'));
    if (isText) {
        const parentStyles = getComputedStyle(element);
        const text = element.textContent;
        for (let char of text) {
            if (char.trim() === '') continue;
            const letterEl = document.createElement('span');
            letterEl.className = 'enemy enemy-letter';
            letterEl.textContent = char;
            Object.assign(letterEl.style, { fontSize: parentStyles.fontSize, fontWeight: parentStyles.fontWeight, fontStyle: parentStyles.fontStyle, color: 'var(--text-color)', position: 'fixed', zIndex: '500', transform: 'translate(-50%, -50%)' });
            document.body.appendChild(letterEl);
            const finalX = Game.bounds.left + Math.random() * (Game.bounds.right - Game.bounds.left);
            Game.enemies.push({ el: letterEl, x: finalX, y: -50 - (Math.random() * 200), hp: hp, speed: Game.settings.enemyBaseSpeed + Math.random() * 1.5, isHit: false });
        }
    } else {
        const enemyEl = element.cloneNode(true);
        enemyEl.classList.add('enemy');
        Object.assign(enemyEl.style, { position: 'fixed', width: `${rect.width}px`, height: `${rect.height}px`, margin: '0', zIndex: '500', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' });
        document.body.appendChild(enemyEl);
        const finalX = Game.bounds.left + rect.width / 2 + (Math.random() - 0.5) * (Game.bounds.right - Game.bounds.left - rect.width);
        Game.enemies.push({ el: enemyEl, x: finalX, y: -100 - (Math.random() * 200), hp: hp, speed: Game.settings.enemyBaseSpeed, isHit: false });
    }
}

function updateEnemies() {
    for (let i = Game.enemies.length - 1; i >= 0; i--) {
        const enemy = Game.enemies[i];
        enemy.y += enemy.speed;
        if (enemy.y > Game.bounds.bottom + 100) {
            enemy.el.remove();
            Game.enemies.splice(i, 1);
        }
    }
}

function renderEnemies() {
    for (const enemy of Game.enemies) {
        if (enemy.el) {
            let scale = 1;
            if (enemy.isHit) { scale = 0.85; }
            enemy.el.style.left = `${enemy.x}px`;
            enemy.el.style.top = `${enemy.y}px`;
            enemy.el.style.transform = `translate(-50%, -50%) scale(${scale})`;
        }
    }
}

function checkCollisions() {
    for (let i = Game.bullets.length - 1; i >= 0; i--) {
        const bullet = Game.bullets[i]; if (!bullet) continue;
        const bulletRect = bullet.getBoundingClientRect();
        for (let j = Game.enemies.length - 1; j >= 0; j--) {
            const enemy = Game.enemies[j]; if (!enemy || !enemy.el) continue;
            const enemyRect = enemy.el.getBoundingClientRect();
            if (bulletRect.left < enemyRect.right && bulletRect.right > enemyRect.left && bulletRect.top < enemyRect.bottom && bulletRect.bottom > enemyRect.top) {
                bullet.remove(); Game.bullets.splice(i, 1);
                enemy.hp--;
                enemy.isHit = true;
                setTimeout(() => { if (enemy) enemy.isHit = false; }, 100);
                if (enemy.hp <= 0) {
                    enemy.el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    enemy.el.style.opacity = '0';
                    enemy.el.style.transform += ' scale(1.5)';
                    setTimeout(() => enemy.el.remove(), 300);
                    Game.enemies.splice(j, 1);
                }
                return;
            }
        }
    }
}