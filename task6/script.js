class SnakeModel {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.reset();
    }

    reset() {
        const middle = Math.floor(this.gridSize / 2);
        this.snake = [
            { x: middle, y: middle },
            { x: middle - 1, y: middle },
            { x: middle - 2, y: middle }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.spawnApple();
    }

    spawnApple() {
        const freeCells = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const busy = this.snake.some(seg => seg.x === x && seg.y === y);
                if (!busy) freeCells.push({ x: x, y: y });
            }
        }
        if (freeCells.length === 0) {
            this.gameOver = true;
            return;
        }
        this.apple = freeCells[Math.floor(Math.random() * freeCells.length)];
    }

    setDirection(dir) {
        const isReverse = dir.x === -this.direction.x && dir.y === -this.direction.y;
        const isSame = dir.x === this.direction.x && dir.y === this.direction.y;
        if (isReverse || isSame) return;
        this.nextDirection = dir;
    }

    bounce() {
        this.snake.reverse();
        this.direction = { x: -this.direction.x, y: -this.direction.y };
        this.nextDirection = { x: this.direction.x, y: this.direction.y };
    }

    checkSelfCollision(head) {
        return this.snake.some(seg => seg.x === head.x && seg.y === head.y);
    }

    update() {
        if (this.gameOver) return;

        this.direction = this.nextDirection;
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        const hitWall = head.x < 0 || head.y < 0 || head.x >= this.gridSize || head.y >= this.gridSize;

        if (hitWall) {
            if (this.lives > 0) {
                this.lives -= 1;
                this.bounce();
                console.log('Отскок от стены, осталось жизней:', this.lives);
                return;
            }
            this.gameOver = true;
            return;
        }

        if (this.checkSelfCollision(head)) {
            this.gameOver = true;
            return;
        }

        const eatsApple = head.x === this.apple.x && head.y === this.apple.y;

        this.snake.unshift(head);
        if (eatsApple) {
            this.score += 1;
            this.spawnApple();
        } else {
            this.snake.pop();
        }
    }
}

class SnakeView {
    constructor(cellSize) {
        this.cell = cellSize;
        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = document.getElementById('score');
        this.livesEl = document.getElementById('lives');
        this.overlayEl = document.getElementById('overlay');
        this.finalScoreEl = document.getElementById('finalScore');
    }

    drawGrid(gridSize) {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 1; i < gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.cell, 0);
            ctx.lineTo(i * this.cell, gridSize * this.cell);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * this.cell);
            ctx.lineTo(gridSize * this.cell, i * this.cell);
            ctx.stroke();
        }
    }

    drawApple(apple) {
        const ctx = this.ctx;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(
            apple.x * this.cell + this.cell / 2,
            apple.y * this.cell + this.cell / 2,
            this.cell / 2 - 3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    drawSnake(snake) {
        const ctx = this.ctx;
        snake.forEach((seg, index) => {
            ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
            ctx.fillRect(seg.x * this.cell + 1, seg.y * this.cell + 1, this.cell - 2, this.cell - 2);
        });
    }

    draw(model) {
        const ctx = this.ctx;
        ctx.fillStyle = '#101828';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height
