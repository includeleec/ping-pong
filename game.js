class PingPongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.playerScoreEl = document.getElementById('player-score');
        this.aiScoreEl = document.getElementById('ai-score');
        
        this.gameRunning = false;
        this.gamePaused = false;
        this.playerScore = 0;
        this.aiScore = 0;
        
        this.balls = [];
        this.ballCount = 1;
        this.ballSpeedMultiplier = 1;
        this.difficultyPreset = 'medium';
        this.initializeBalls();
        
        this.soundEnabled = true;
        this.audioContext = null;
        this.setupAudioContext();
        
        this.player = {
            x: 20,
            y: this.canvas.height / 2 - 50,
            width: 10,
            height: 100,
            speed: 6,
            color: '#10b981'
        };
        
        this.ai = {
            x: this.canvas.width - 30,
            y: this.canvas.height / 2 - 50,
            width: 10,
            height: 100,
            speed: 4,
            color: '#ef4444'
        };
        
        this.keys = {};
        this.mouseY = this.canvas.height / 2;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupDifficultyControls();
        this.draw();
        this.updateScore();
        
        // Resume audio context on first user interaction
        document.addEventListener('click', () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseY = e.clientY - rect.top;
            if (this.gameRunning && !this.gamePaused) {
                this.player.y = this.mouseY - this.player.height / 2;
                this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
            }
        });
        
        this.canvas.addEventListener('click', () => {
            if (!this.gameRunning) {
                this.startGame();
            }
        });
    }
    
    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.soundEnabled = false;
        }
    }
    
    playSound(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playHitSound() {
        this.playSound(800, 0.1, 'square', 0.2);
    }
    
    playMissSound() {
        this.playSound(200, 0.3, 'sawtooth', 0.15);
    }
    
    playWinSound() {
        this.playSound(523, 0.2, 'sine', 0.2); // C5
        setTimeout(() => this.playSound(659, 0.2, 'sine', 0.2), 100); // E5
        setTimeout(() => this.playSound(784, 0.3, 'sine', 0.2), 200); // G5
    }
    
    playLoseSound() {
        this.playSound(400, 0.3, 'sawtooth', 0.2);
        setTimeout(() => this.playSound(300, 0.4, 'sawtooth', 0.15), 100);
    }
    
    playBounceSound() {
        this.playSound(600, 0.05, 'triangle', 0.1);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundToggle');
        if (soundBtn) {
            soundBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
        }
    }
    
    setupDifficultyControls() {
        this.ballCountSelect = document.getElementById('ballCount');
        this.ballSpeedSelect = document.getElementById('ballSpeed');
        this.difficultyPresetSelect = document.getElementById('difficultyPreset');
        
        this.ballCountSelect.addEventListener('change', (e) => {
            this.ballCount = parseInt(e.target.value);
            this.initializeBalls();
        });
        
        this.ballSpeedSelect.addEventListener('change', (e) => {
            this.ballSpeedMultiplier = parseInt(e.target.value);
            this.initializeBalls();
        });
        
        this.difficultyPresetSelect.addEventListener('change', (e) => {
            this.setDifficultyPreset(e.target.value);
        });
        
        const soundBtn = document.getElementById('soundToggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => this.toggleSound());
        }
    }

    initializeBalls() {
        this.balls = [];
        for (let i = 0; i < this.ballCount; i++) {
            const ball = {
                x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: this.canvas.height / 2 + (Math.random() - 0.5) * 100,
                dx: (Math.random() > 0.5 ? 1 : -1) * 4 * this.ballSpeedMultiplier,
                dy: (Math.random() - 0.5) * 6 * this.ballSpeedMultiplier,
                radius: 10,
                color: this.getBallColor(i)
            };
            this.balls.push(ball);
        }
    }

    getBallColor(index) {
        const colors = ['#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
        return colors[index % colors.length];
    }

    setDifficultyPreset(preset) {
        this.difficultyPreset = preset;
        switch (preset) {
            case 'easy':
                this.ballCount = 1;
                this.ballSpeedMultiplier = 0.8;
                break;
            case 'medium':
                this.ballCount = 2;
                this.ballSpeedMultiplier = 1.2;
                break;
            case 'hard':
                this.ballCount = 3;
                this.ballSpeedMultiplier = 1.8;
                break;
            case 'extreme':
                this.ballCount = 5;
                this.ballSpeedMultiplier = 2.5;
                break;
        }
        
        this.ballCountSelect.value = this.ballCount;
        this.ballSpeedSelect.value = Math.round(this.ballSpeedMultiplier);
        this.initializeBalls();
    }

    resetBalls() {
        this.balls.forEach(ball => {
            ball.x = this.canvas.width / 2 + (Math.random() - 0.5) * 200;
            ball.y = this.canvas.height / 2 + (Math.random() - 0.5) * 100;
            ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4 * this.ballSpeedMultiplier;
            ball.dy = (Math.random() - 0.5) * 6 * this.ballSpeedMultiplier;
        });
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameLoop();
            this.startBtn.textContent = '游戏中...';
        }
    }
    
    pauseGame() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            this.pauseBtn.textContent = this.gamePaused ? '继续' : '暂停';
            if (!this.gamePaused) {
                this.gameLoop();
            }
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.playerScore = 0;
        this.aiScore = 0;
        this.resetBalls();
        this.player.y = this.canvas.height / 2 - 50;
        this.ai.y = this.canvas.height / 2 - 50;
        this.updateScore();
        this.startBtn.textContent = '开始游戏';
        this.pauseBtn.textContent = '暂停';
        this.draw();
    }
    
    
    updateScore() {
        this.playerScoreEl.textContent = this.playerScore;
        this.aiScoreEl.textContent = this.aiScore;
    }
    
    handleInput() {
        if (this.keys['ArrowUp'] && this.player.y > 0) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] && this.player.y < this.canvas.height - this.player.height) {
            this.player.y += this.player.speed;
        }
    }
    
    updateAI() {
        if (this.balls.length === 0) return;
        
        const aiCenter = this.ai.y + this.ai.height / 2;
        
        let closestBall = this.balls[0];
        let minDistance = Math.abs(this.balls[0].x - this.ai.x);
        
        for (let ball of this.balls) {
            const distance = Math.abs(ball.x - this.ai.x);
            if (distance < minDistance) {
                minDistance = distance;
                closestBall = ball;
            }
        }
        
        const ballY = closestBall.y;
        
        if (Math.abs(aiCenter - ballY) > 10) {
            if (aiCenter < ballY && this.ai.y < this.canvas.height - this.ai.height) {
                this.ai.y += this.ai.speed;
            } else if (aiCenter > ballY && this.ai.y > 0) {
                this.ai.y -= this.ai.speed;
            }
        }
    }
    
    updateBalls() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            if (ball.y - ball.radius <= 0 || 
                ball.y + ball.radius >= this.canvas.height) {
                ball.dy = -ball.dy;
                this.playBounceSound();
            }
            
            if (ball.x - ball.radius <= this.player.x + this.player.width &&
                ball.y >= this.player.y && 
                ball.y <= this.player.y + this.player.height &&
                ball.dx < 0) {
                ball.dx = -ball.dx;
                const hitPosition = (ball.y - this.player.y) / this.player.height;
                ball.dy = (hitPosition - 0.5) * 8;
                this.playHitSound();
            }
            
            if (ball.x + ball.radius >= this.ai.x &&
                ball.y >= this.ai.y && 
                ball.y <= this.ai.y + this.ai.height &&
                ball.dx > 0) {
                ball.dx = -ball.dx;
                const hitPosition = (ball.y - this.ai.y) / this.ai.height;
                ball.dy = (hitPosition - 0.5) * 8;
                this.playHitSound();
            }
            
            if (ball.x < 0) {
                this.aiScore++;
                this.updateScore();
                this.playMissSound();
                this.checkWin();
                ball.x = this.canvas.width / 2 + (Math.random() - 0.5) * 200;
                ball.y = this.canvas.height / 2 + (Math.random() - 0.5) * 100;
                ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4 * this.ballSpeedMultiplier;
                ball.dy = (Math.random() - 0.5) * 6 * this.ballSpeedMultiplier;
            }
            
            if (ball.x > this.canvas.width) {
                this.playerScore++;
                this.updateScore();
                this.playMissSound();
                this.checkWin();
                ball.x = this.canvas.width / 2 + (Math.random() - 0.5) * 200;
                ball.y = this.canvas.height / 2 + (Math.random() - 0.5) * 100;
                ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4 * this.ballSpeedMultiplier;
                ball.dy = (Math.random() - 0.5) * 6 * this.ballSpeedMultiplier;
            }
        }
    }
    
    checkWin() {
        if (this.playerScore >= 10) {
            this.gameRunning = false;
            this.playWinSound();
            alert('恭喜你获胜！');
            this.resetGame();
        } else if (this.aiScore >= 10) {
            this.gameRunning = false;
            this.playLoseSound();
            alert('电脑获胜！再接再厉！');
            this.resetGame();
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();
        this.drawNet();
        this.drawPaddle(this.player);
        this.drawPaddle(this.ai);
        this.drawBalls();
        
        if (!this.gameRunning && !this.gamePaused) {
            this.drawStartMessage();
        }
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#f0f9ff');
        gradient.addColorStop(1, '#e0f2fe');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawNet() {
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.strokeStyle = '#94a3b8';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawPaddle(paddle) {
        this.ctx.fillStyle = paddle.color;
        this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        
        this.ctx.shadowColor = paddle.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        this.ctx.shadowBlur = 0;
    }
    
    drawBalls() {
        this.balls.forEach(ball => {
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = ball.color;
            this.ctx.fill();
            
            this.ctx.shadowColor = ball.color;
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawStartMessage() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('点击开始游戏或按空格键', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('使用鼠标或↑↓键控制球拍', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.handleInput();
        this.updateAI();
        this.updateBalls();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new PingPongGame();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && !game.gameRunning) {
            e.preventDefault();
            game.startGame();
        }
    });
    
    window.addEventListener('resize', () => {
        const canvas = document.getElementById('gameCanvas');
        const container = canvas.parentElement;
        const maxWidth = Math.min(container.clientWidth - 80, 800);
        const aspectRatio = 800 / 400;
        
        if (maxWidth < 800) {
            canvas.style.width = maxWidth + 'px';
            canvas.style.height = (maxWidth / aspectRatio) + 'px';
        } else {
            canvas.style.width = '800px';
            canvas.style.height = '400px';
        }
    });
    
    window.dispatchEvent(new Event('resize'));
});