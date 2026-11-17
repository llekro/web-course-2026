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

    checkCollision(head, grows) {
        if (head.x < 0 || head.y < 0 || head.x >= this.gridSize || head.y >= this.gridSize) {
            return true;
        }
        const body = grows ? this.snake : this.snake.slice(0, -1);
        return body.some(seg => seg.x === head.x && seg.y === head.y);
    }

    update() {
        if (this.gameOver) return;

        this.direction = this.nextDirection;
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        const eatsApple = head.x === this.apple.x && head.y === this.apple.y;

        if (this.checkCollision(head, eatsApple)) {
            this.gameOver = true;
            return;
        }

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
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid(model.gridSize);
        this.drawApple(model.apple);
        this.drawSnake(model.snake);
        this.scoreEl.textContent = model.score;
    }

    showGameOver(score) {
        if (this.overlayEl.classList.contains('visible')) return;
        this.finalScoreEl.textContent = score;
        this.overlayEl.classList.add('visible');
    }

    hideGameOver() {
        this.overlayEl.classList.remove('visible');
    }
}

class GameController {
    constructor(model, view, moveInterval) {
        this.model = model;
        this.view = view;
        this.moveInterval = moveInterval;
        this.lastMoveTime = 0;
        this.loopStarted = false;
        this.directions = {
            ArrowUp: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 }
        };

        document.getElementById('restartBtn').addEventListener('click', () => this.start());
        document.addEventListener('keydown', (event) => this.handleKey(event));
    }

    start() {
        this.model.reset();
        this.view.hideGameOver();
        this.lastMoveTime = performance.now();
        if (!this.loopStarted) {
            this.loopStarted = true;
            requestAnimationFrame((timestamp) => this.loop(timestamp));
        }
    }

    loop(timestamp) {
        if (!this.model.gameOver) {
            if (timestamp - this.lastMoveTime >= this.moveInterval) {
                this.lastMoveTime = timestamp;
                this.model.update();
            }
        } else {
            this.view.showGameOver(this.model.score);
        }
        this.view.draw(this.model);
        requestAnimationFrame((next) => this.loop(next));
    }

    handleKey(event) {
        const dir = this.directions[event.key];
        if (!dir || this.model.gameOver) return;
        event.preventDefault();
        this.model.setDirection(dir);
    }
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const MOVE_INTERVAL = 150;

const model = new SnakeModel(GRID_SIZE);
const view = new SnakeView(CELL_SIZE);
const controller = new GameController(model, view, MOVE_INTERVAL);
controller.start();
