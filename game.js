// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Game state
let gameState = 'start'; // 'start', 'playing', 'paused', 'gameover'
let score = 0;
let lives = 3;
let level = 1;
let enemySpeed = 1;
let enemySpawnRate = 100;

// Player object
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 5,
    color: '#00ff88'
};

// Arrays for game objects
let bullets = [];
let enemies = [];
let particles = [];

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault();
        shootBullet();
    }
    
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }
    
    if ((e.key === 'r' || e.key === 'R') && gameState === 'gameover') {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// UI event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);

function startGame() {
    gameState = 'playing';
    document.getElementById('startScreen').classList.add('hidden');
    gameLoop();
}

function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        document.getElementById('pauseScreen').classList.remove('hidden');
    } else if (gameState === 'paused') {
        gameState = 'playing';
        document.getElementById('pauseScreen').classList.add('hidden');
        gameLoop();
    }
}

function restartGame() {
    score = 0;
    lives = 3;
    level = 1;
    enemySpeed = 1;
    enemySpawnRate = 100;
    bullets = [];
    enemies = [];
    particles = [];
    player.x = canvas.width / 2 - 20;
    player.y = canvas.height - 80;
    
    updateUI();
    document.getElementById('gameOverScreen').classList.add('hidden');
    gameState = 'playing';
    gameLoop();
}

function shootBullet() {
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 15,
        speed: 7,
        color: '#ffff00'
    });
}

function spawnEnemy() {
    const size = 30 + Math.random() * 20;
    enemies.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: enemySpeed + Math.random() * 0.5,
        color: '#ff0066',
        health: 1
    });
}

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 30,
            color: color,
            size: Math.random() * 3 + 2
        });
    }
}

function updatePlayer() {
    // Move left
    if ((keys['ArrowLeft'] || keys['a']) && player.x > 0) {
        player.x -= player.speed;
    }
    // Move right
    if ((keys['ArrowRight'] || keys['d']) && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    // Move up
    if ((keys['ArrowUp'] || keys['w']) && player.y > canvas.height / 2) {
        player.y -= player.speed;
    }
    // Move down
    if ((keys['ArrowDown'] || keys['s']) && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > -bullet.height;
    });
}

function updateEnemies() {
    enemies = enemies.filter(enemy => {
        enemy.y += enemy.speed;
        
        // Check collision with player
        if (checkCollision(player, enemy)) {
            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
            lives--;
            updateUI();
            
            if (lives <= 0) {
                gameOver();
            }
            return false;
        }
        
        return enemy.y < canvas.height + enemy.height;
    });
}

function updateParticles() {
    particles = particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        return particle.life > 0;
    });
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (checkCollision(bullet, enemy)) {
                // Create explosion effect
                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                
                // Remove bullet and enemy
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                
                // Update score
                score += 10;
                
                // Level up every 500 points
                if (score % 500 === 0 && score > 0) {
                    level++;
                    enemySpeed += 0.3;
                    enemySpawnRate = Math.max(50, enemySpawnRate - 10);
                }
                
                updateUI();
            }
        });
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

function gameOver() {
    gameState = 'gameover';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function drawPlayer() {
    // Draw ship body
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = player.color;
    
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height - 10);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = enemy.color;
        
        // Draw enemy as octagon
        ctx.beginPath();
        const centerX = enemy.x + enemy.width / 2;
        const centerY = enemy.y + enemy.height / 2;
        const radius = enemy.width / 2;
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

function drawParticles() {
    particles.forEach(particle => {
        const alpha = particle.life / 30;
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        ctx.globalAlpha = 1;
    });
}

function drawStars() {
    // Draw background stars (static effect)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 50; i++) {
        const x = (i * 137 + Date.now() * 0.01) % canvas.width;
        const y = (i * 97) % canvas.height;
        const size = (i % 3) + 1;
        ctx.fillRect(x, y, size, size);
    }
}

let frameCount = 0;

function gameLoop() {
    if (gameState !== 'playing') return;
    
    frameCount++;
    
    // Spawn enemies
    if (frameCount % enemySpawnRate === 0) {
        spawnEnemy();
    }
    
    // Update
    updatePlayer();
    updateBullets();
    updateEnemies();
    updateParticles();
    checkCollisions();
    
    // Clear canvas
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw
    drawStars();
    drawParticles();
    drawEnemies();
    drawBullets();
    drawPlayer();
    
    requestAnimationFrame(gameLoop);
}

// Initial UI update
updateUI();
