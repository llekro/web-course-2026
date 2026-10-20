(function () {
    const CELL = 20;
    const GRID = 20;
    const MOVE_INTERVAL = 150;

    const DIRECTIONS = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
    };

    const model = {
        snake: [],
        direction: null,
        nextDirection: null,
        apple: null,
        score: 0,
        gameOver: false
    };

    function resetState() {
        model.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        model.direction = { x: 1, y: 0 };
        model.nextDirection = { x: 1, y: 0 };
        model.score = 0;
        model.gameOver = false;
        spawnApple();
    }

    function spawnApple() {
        const freeCells = [];
        for (let y = 0; y < GRID; y++) {
            for (let x = 0; x < GRID; x++) {
                const busy = model.snake.some(seg => seg.x === x && seg.y === y);
                if (!busy) freeCells.push({ x: x, y: y });
            }
        }
        if (freeCells.length === 0) {
            model.gameOver = true;
            return;
        }
        model.apple = freeCells[Math.floor(Math.random() * freeCells.length)];
    }

    function checkCollision(head, grows) {
        if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) {
            return true;
        }
        const body = grows ? model.snake : model.snake.slice(0, -1);
        return body.some(seg => seg.x === head.x && seg.y === head.y);
    }

    function moveSnake() {
        model.direction = model.nextDirection;
        const head = {
            x: model.snake[0].x + model.direction.x,
            y: model.snake[0].y + model.direction.y
        };
        const eatsApple = head.x === model.apple.x && head.y === model.apple.y;

        if (checkCollision(head, eatsApple)) {
            model.gameOver = true;
            return;
        }

        model.snake.unshift(head);
        if (eatsApple) {
            model.score++;
            spawnApple();
        } else {
            model.snake.pop();
        }
    }

    function setDirection(dir) {
        const isReverse = dir.x === -model.direction.x && dir.y === -model.direction.y;
        const isSame = dir.x === model.direction.x && dir.y === model.direction.y;
        if (isReverse || isSame) return;
        model.nextDirection = dir;
    }

    function update() {
        if (model.gameOver) return;
        moveSnake();
    }

    const view = (function () {
        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score');
        const overlayEl = document.getElementById('overlay');
        const finalScoreEl = document.getElementById('finalScore');

        function drawGrid() {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let i = 1; i < GRID; i++) {
                ctx.beginPath();
                ctx.moveTo(i * CELL, 0);
                ctx.lineTo(i * CELL, GRID * CELL);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * CELL);
                ctx.lineTo(GRID * CELL, i * CELL);
                ctx.stroke();
            }
        }

        function drawApple(apple) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(
                apple.x * CELL + CELL / 2,
                apple.y * CELL + CELL / 2,
                CELL / 2 - 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        function drawSnake(snake) {
            snake.forEach(function (seg, index) {
                ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
                ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
            });
        }

        function draw(state) {
            ctx.fillStyle = '#101828';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawGrid();
            drawApple(state.apple);
            drawSnake(state.snake);
            scoreEl.textContent = state.score;
        }

        function showGameOver(score) {
            if (overlayEl.classList.contains('visible')) return;
            finalScoreEl.textContent = score;
            overlayEl.classList.add('visible');
        }

        function hideGameOver() {
            overlayEl.classList.remove('visible');
        }

        return {
            draw: draw,
            showGameOver: showGameOver,
            hideGameOver: hideGameOver
        };
    })();

    let lastMoveTime = 0;

    function loop(timestamp) {
        if (!model.gameOver) {
            if (timestamp - lastMoveTime >= MOVE_INTERVAL) {
                lastMoveTime = timestamp;
                update();
            }
        } else {
            view.showGameOver(model.score);
        }
        view.draw(model);
        requestAnimationFrame(loop);
    }

    function handleKey(event) {
        const dir = DIRECTIONS[event.key];
        if (!dir || model.gameOver) return;
        event.preventDefault();
        setDirection(dir);
    }

    function startGame() {
        resetState();
        view.hideGameOver();
        lastMoveTime = performance.now();
    }

    document.getElementById('restartBtn').addEventListener('click', startGame);
    document.addEventListener('keydown', handleKey);

    startGame();
    requestAnimationFrame(loop);
})();
