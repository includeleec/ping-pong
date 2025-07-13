class PingPongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.touchZone = document.getElementById('touchZone');
        this.touchIndicator = document.querySelector('.touch-indicator');
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
        this.touchY = this.canvas.height / 2;
        this.isMobile = this.detectMobile();
        this.isTouch = 'ontouchstart' in window;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupDifficultyControls();
        this.draw();
        this.updateScore();
        this.handleOrientation();
        
        // Resume audio context on first user interaction
        document.addEventListener('click', () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });
    }
    
    handleOrientation() {
        // 监听屏幕方向变化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.adjustForOrientation(), 100);
        });
        
        // 监听屏幕尺寸变化
        window.addEventListener('resize', () => {
            this.adjustForOrientation();
        });
        
        this.adjustForOrientation();
    }
    
    adjustForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const gameContainer = document.querySelector('.game-container');
        
        if (this.isMobile && isLandscape) {
            // 手机横屏模式优化
            gameContainer.style.height = '100vh';
            gameContainer.style.maxWidth = '100vw';
            gameContainer.style.borderRadius = '0';
            
            // 强制横屏提示（如果需要）
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {
                    console.log('无法锁定横屏模式');
                });
            }
        } else if (!document.fullscreenElement) {
            // 恢复正常模式
            gameContainer.style.height = 'auto';
            gameContainer.style.maxWidth = '900px';
            gameContainer.style.borderRadius = '20px';
        }
    }
    
        detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768 && 'ontouchstart' in window);
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // 鼠标控制
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isTouch) return; // 触摸设备忽略鼠标
            const rect = this.canvas.getBoundingClientRect();
            
            let mouseY = e.clientY - rect.top;
            
            this.mouseY = mouseY;
            if (this.gameRunning && !this.gamePaused) {
                this.player.y = this.mouseY - this.player.height / 2;
                this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
            }
        });
        
        // 触摸控制
        if (this.isTouch || this.isMobile) {
            this.setupTouchControls();
        }
        
        this.canvas.addEventListener('click', () => {
            if (!this.gameRunning) {
                this.startGame();
            }
        });
        
        // 监听全屏变化
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
    }
    
    setupTouchControls() {
        const handleTouch = (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.gamePaused) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0] || e.changedTouches[0];
            
            let touchY = touch.clientY - rect.top;
            
            this.touchY = touchY;
            this.player.y = this.touchY - this.player.height / 2;
            this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
            
            // 更新触摸指示器
            if (this.touchIndicator) {
                this.touchIndicator.style.left = '20px';
                this.touchIndicator.style.top = this.touchY + 'px';
                this.touchIndicator.classList.add('active');
            }
        };
        
        const handleTouchEnd = () => {
            if (this.touchIndicator) {
                this.touchIndicator.classList.remove('active');
            }
        };
        
        this.touchZone.addEventListener('touchstart', handleTouch, { passive: false });
        this.touchZone.addEventListener('touchmove', handleTouch, { passive: false });
        this.touchZone.addEventListener('touchend', handleTouchEnd, { passive: false });
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
        if (this.isTouch || this.isMobile) {
            // 触摸设备使用触摸控制
            this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
        } else {
            // 键盘控制
            if (this.keys['ArrowUp'] && this.player.y > 0) {
                this.player.y -= this.player.speed;
            }
            if (this.keys['ArrowDown'] && this.player.y < this.canvas.height - this.player.height) {
                this.player.y += this.player.speed;
            }
            
            // 鼠标控制（非触摸设备）
            if (!this.isTouch && this.gameRunning && !this.gamePaused) {
                this.player.y = this.mouseY - this.player.height / 2;
                this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
            }
        }
    }
    
    toggleFullscreen() {
        const gameContainer = document.querySelector('.game-container');
        
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
            if (gameContainer.requestFullscreen) {
                gameContainer.requestFullscreen();
            } else if (gameContainer.webkitRequestFullscreen) {
                gameContainer.webkitRequestFullscreen();
            } else if (gameContainer.mozRequestFullScreen) {
                gameContainer.mozRequestFullScreen();
            } else if (gameContainer.msRequestFullscreen) {
                gameContainer.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    handleFullscreenChange() {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
            this.fullscreenBtn.textContent = '⛶';
            this.fullscreenBtn.title = '退出全屏';
        } else {
            this.fullscreenBtn.textContent = '⛶';
            this.fullscreenBtn.title = '全屏模式';
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
            this.showConfetti();
            setTimeout(() => {
                alert('恭喜你获胜！');
                this.resetGame();
            }, 2000);
        } else if (this.aiScore >= 10) {
            this.gameRunning = false;
            this.playLoseSound();
            setTimeout(() => {
                alert('电脑获胜！再接再厉！');
                this.resetGame();
            }, 1000);
        }
    }

    showConfetti() {
        this.confetti = [];
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff69b4', '#ffa500'];
        
        for (let i = 0; i < 100; i++) {
            this.confetti.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                vx: (Math.random() - 0.5) * 8,
                vy: Math.random() * 3 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 4 + 2,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
        
        this.animateConfetti();
    }

    animateConfetti() {
        if (!this.confetti || this.confetti.length === 0) return;
        
        this.confetti.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.rotation += particle.rotationSpeed;
            
            if (particle.y > this.canvas.height) {
                this.confetti.splice(index, 1);
            }
        });
        
        if (this.confetti.length > 0) {
            requestAnimationFrame(() => this.animateConfetti());
        }
    }

    drawConfetti() {
        if (!this.confetti) return;
        
        this.confetti.forEach(particle => {
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation * Math.PI / 180);
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            this.ctx.restore();
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();
        this.drawNet();
        this.drawPaddle(this.player);
        this.drawPaddle(this.ai);
        this.drawBalls();
        this.drawConfetti();
        
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
        this.ctx.fillText('点击开始游戏或按空格键', this.canvas.width / 2, this.canvas.height / 2 - 10);
        
        let controlText = this.isMobile ? '触摸屏幕控制球拍' : '使用鼠标或↑↓键控制球拍';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(controlText, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        if (this.isMobile) {
            this.ctx.font = '14px Arial';
            this.ctx.fillText('上下滑动控制球拍移动', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
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
        const aspectRatio = 800 / 400;
        
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
            // 全屏模式下的响应式调整 - 最大化游戏区域
            const maxHeight = window.innerHeight - 50; // 为顶部单行控制按钮留出50px空间
            const maxWidthFullscreen = window.innerWidth * 0.98;
            const targetWidth = Math.min(maxWidthFullscreen, maxHeight * aspectRatio);
            
            canvas.style.width = targetWidth + 'px';
            canvas.style.height = (targetWidth / aspectRatio) + 'px';
        } else if (window.innerWidth <= 768) {
            // 移动设备响应式调整
            const maxWidth = Math.min(container.clientWidth - 20, window.innerWidth - 20);
            canvas.style.width = maxWidth + 'px';
            canvas.style.height = (maxWidth / aspectRatio) + 'px';
        } else {
            canvas.style.width = '800px';
            canvas.style.height = '400px';
        }
    });
    
    window.dispatchEvent(new Event('resize'));
});