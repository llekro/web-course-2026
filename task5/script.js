let sequence = [];
let playerSequence = [];
let level = 0;
let isShowingSequence = false;
let isGameOver = false;

const buttons = document.querySelectorAll('.simon-btn');
const startBtn = document.getElementById('startBtn');
const levelEl = document.getElementById('level');
const messageEl = document.getElementById('message');
const boardEl = document.getElementById('simonBoard');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function activateButton(index) {
    const btn = buttons[index];
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 400);
}

async function playSequence() {
    isShowingSequence = true;
    playerSequence = [];
    messageEl.textContent = 'Запоминайте...';
    messageEl.className = 'message';
    
    await sleep(800);
    
    for (let i = 0; i < sequence.length; i++) {
        activateButton(sequence[i]);
        await sleep(600);
    }
    
    isShowingSequence = false;
    messageEl.textContent = 'Ваш ход!';
    messageEl.className = 'message success';
}

function handlePlayerClick(index) {
    if (isGameOver || isShowingSequence) return;

    activateButton(index);
    playerSequence.push(index);

    const currentIndex = playerSequence.length - 1;

    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        isGameOver = true;
        messageEl.textContent = `Вы дошли до уровня ${level}`;
        messageEl.className = 'message error';
        boardEl.classList.add('shake');
        setTimeout(() => boardEl.classList.remove('shake'), 500);
        startBtn.disabled = false;
        return;
    }

    if (playerSequence.length === sequence.length) {
        level++;
        levelEl.textContent = level;
        messageEl.textContent = 'Верно!';
        
        setTimeout(() => {
            messageEl.textContent = '';
            sequence.push(Math.floor(Math.random() * 4));
            playSequence();
        }, 1000);
    }
}

function startGame() {
    sequence = [];
    playerSequence = [];
    level = 0;
    isGameOver = false;
    isShowingSequence = false;
    levelEl.textContent = '0';
    messageEl.textContent = '';
    messageEl.className = 'message';
    startBtn.disabled = true;
    
    sequence.push(Math.floor(Math.random() * 4));
    playSequence();
}

buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => handlePlayerClick(index));
});

startBtn.addEventListener('click', startGame);
