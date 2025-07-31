// assets/js/game/enemy.js

function loadLevel(levelIndex) {
    if (levelIndex !== 1) return;
    console.log("Loading Level 1...");

    const section = document.querySelector(`[data-section-id="1"]`);
    if (!section) return;

    const waveConfig = [
        { type: 'transition', text: 'УРОВЕНЬ 1', delay: 500, hp: 1 },
        { selector: 'h1', type: 'fighter', delay: 3000, hp: 2 },
        { selector: '.nickname', type: 'sniper', delay: 6000, hp: 4, formation: 'sequential' },
        { selector: '.profession-line > span', type: 'fighter', delay: 9000, hp: 2 },
        { selector: '.separator-icon-large', type: 'shield', delay: 9000, hp: Infinity },
        { selector: '.philosophy', type: 'rain', delay: 12000, hp: 1 }
    ];

    section.style.visibility = 'visible';
    section.style.opacity = '1';
    section.style.display = 'flex';

    waveConfig.forEach(config => {
        setTimeout(() => {
            if (config.type === 'transition') {
                createEnemiesFromText(config.text, { fontSize: '48px', fontWeight: '900' }, config.hp, config.type);
            } else {
                const elements = section.querySelectorAll(config.selector);
                elements.forEach(el => {
                    createEnemiesFromElement(el, config);
                });
            }
        }, config.delay);
    });

    setTimeout(() => {
        section.style.visibility = 'hidden';
        section.style.opacity = '0';
        section.style.pointerEvents = 'none';
    }, 100);
}

function createEnemiesFromElement(element, config) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    if (element.textContent.trim().length > 0 && config.type !== 'shield') {
        createEnemiesFromText(element.textContent, getComputedStyle(element), config.hp, config.type, config.formation);
    } else {
        const enemyEl = element.cloneNode(true);
        enemyEl.classList.add('enemy');
        Object.assign(enemyEl.style, { position: 'fixed', width: `${rect.width}px`, height: `${rect.height}px`, margin: '0', zIndex: '500', transform: 'translate(-50%, -50%)' });
        document.body.appendChild(enemyEl);
        const finalX = Game.bounds.left + rect.width / 2 + (Math.random() - 0.5) * (Game.bounds.right - Game.bounds.left - rect.width);
        Game.enemies.push({ el: enemyEl, x: finalX, y: -100, hp: config.hp, type: config.type, speed: 0.3, isHit: false });
    }
}

function createEnemiesFromText(text, styles, hp, type, formation = 'tight') {
    const chars = text.split('');
    const baseFontSize = parseFloat(styles.fontSize);
    const finalFontSize = Math.max(baseFontSize, 24);
    const charWidth = finalFontSize * 0.6;
    let visibleCharIndex = 0;

    chars.forEach((char, index) => {
        if (char.trim() === '') return;
        
        const letterEl = document.createElement('span');
        letterEl.className = 'enemy enemy-letter';
        letterEl.textContent = char;
        Object.assign(letterEl.style, { fontSize: `${finalFontSize}px`, fontWeight: styles.fontWeight, fontStyle: styles.fontStyle, color: 'var(--text-color)', position: 'fixed', zIndex: '500', transform: 'translate(-50%, -50%)' });
        document.body.appendChild(letterEl);

        let finalX;
        if (formation === 'sequential') {
            const positions = ['left', 'right', 'center'];
            const pos = positions[visibleCharIndex % positions.length];
            if (pos === 'left') finalX = Game.bounds.left + 50;
            else if (pos === 'right') finalX = Game.bounds.right - 50;
            else finalX = (Game.bounds.left + Game.bounds.right) / 2;
        } else {
            finalX = Game.bounds.left + Math.random() * (Game.bounds.right - Game.bounds.left);
        }
        
        Game.enemies.push({
            el: letterEl, x: finalX, y: -50, originX: finalX, hp, type,
            speed: type === 'transition' ? 0.8 : Game.settings.enemyBaseSpeed + Math.random(),
            isHit: false,
            state: 'descending',
            stateTimer: Date.now() + (formation === 'sequential' ? visibleCharIndex * 2000 : 0) // Задержка для снайперов
        });
        visibleCharIndex++;
    });
}


function updateEnemies() {
    for (let i = Game.enemies.length - 1; i >= 0; i--) {
        const enemy = Game.enemies[i];
        
        switch (enemy.type) {
            case 'sniper':
                // Фаза 1: Спуск до точки прицеливания
                if (enemy.state === 'descending' && enemy.y < Game.bounds.top + 100) {
                    enemy.y += enemy.speed * 3;
                } else if (enemy.state === 'descending') {
                    enemy.state = 'aiming'; // Достигли точки, начинаем целиться
                    enemy.stateTimer = Date.now();
                }
                
                // Фаза 2: Прицеливание (2 секунды)
                if (enemy.state === 'aiming' && Date.now() - enemy.stateTimer > 2000) {
                    createEnemyBullet(enemy.x, enemy.y);
                    enemy.state = 'attacking'; // После выстрела продолжаем падать
                }

                // Фаза 3: Медленное падение после атаки
                if (enemy.state === 'attacking') {
                    enemy.y += enemy.speed * 0.5;
                }
                break;
            
            case 'fighter':
                enemy.y += enemy.speed;
                enemy.x = enemy.originX + Math.sin(enemy.y * 0.05 + (enemy.waveOffset || 0)) * 20;
                break;

            default: // rain, transition, shield
                enemy.y += enemy.speed;
                break;
        }

        if (enemy.y > Game.bounds.bottom + 50) {
            // ... (будущая логика "Шума" и урона)
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
    // ... (без изменений)
}

function createEnemyBullet(x, y) {
    const bullet = document.createElement('div');
    bullet.className = 'enemy-bullet';
    document.body.appendChild(bullet);
    const dx = Game.player.x - x;
    const dy = Game.player.y - y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    Game.enemyBullets.push({ el: bullet, x, y, vx: (dx / dist) * 4, vy: (dy / dist) * 4 });
}

function updateEnemyBullets() {
    for (let i = Game.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = Game.enemyBullets[i];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.el.style.left = `${bullet.x}px`;
        bullet.el.style.top = `${bullet.y}px`;
        if (bullet.y > Game.bounds.bottom + 20) {
            bullet.el.remove();
            Game.enemyBullets.splice(i, 1);
        }
    }
}