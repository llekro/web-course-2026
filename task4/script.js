let secretNumber = '';
let attempts = 0;
let history = [];
let isGameOver = false;

const inputEl = document.getElementById('guessInput');
const checkBtn = document.getElementById('checkBtn');
const newGameBtn = document.getElementById('newGameBtn');
const attemptsEl = document.getElementById('attempts');
const historyEl = document.getElementById('history');
const messageEl = document.getElementById('message');

function generateNumber() {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let result = '';
    for (let i = 0; i < 4; i++) {
        const idx = Math.floor(Math.random() * digits.length);
        result += digits[idx];
        digits.splice(idx, 1);
    }
    return result;
}

function validateInput(value) {
    if (!/^\d{4}$/.test(value)) {
        return { valid: false, msg: 'Введите ровно 4 цифры' };
    }
    if (new Set(value).size !== 4) {
        return { valid: false, msg: 'Все цифры должны быть разными' };
    }
    return { valid: true, msg: '' };
}

function countBullsAndCows(secret, guess) {
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < 4; i++) {
        if (guess[i] === secret[i]) {
            bulls++;
        } else if (secret.includes(guess[i])) {
            cows++;
        }
    }
    return { bulls, cows };
}

function getBullWord(n) {
    if (n === 1) return 'бык';
    if (n >= 2 && n <= 4) return 'быка';
    return 'быков';
}

function getCowWord(n) {
    if (n === 1) return 'корова';
    if (n >= 2 && n <= 4) return 'коровы';
    return 'коров';
}

function renderHistory() {
    historyEl.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<span>${item.guess}</span><span>${item.bulls} ${getBullWord(item.bulls)}, ${item.cows} ${getCowWord(item.cows)}</span>`;
        historyEl.appendChild(div);
    });
}

function checkGuess() {
    if (isGameOver) return;
    
    const val = inputEl.value.trim();
    const validation = validateInput(val);
    
    if (!validation.valid) {
        messageEl.textContent = validation.msg;
        messageEl.className = 'message error';
        inputEl.classList.add('shake');
        setTimeout(() => inputEl.classList.remove('shake'), 400);
        return;
    }

    messageEl.textContent = '';
    attempts++;
    attemptsEl.textContent = attempts;
    
    const result = countBullsAndCows(secretNumber, val);
    history.push({ guess: val, bulls: result.bulls, cows: result.cows });
    renderHistory();
    inputEl.value = '';

    if (result.bulls === 4) {
        isGameOver = true;
        messageEl.textContent = `Победа! Угадано за ${attempts} попыток`;
        messageEl.className = 'message success';
        inputEl.disabled = true;
        checkBtn.disabled = true;
    }
}

function newGame() {
    secretNumber = generateNumber();
    attempts = 0;
    history = [];
    isGameOver = false;
    attemptsEl.textContent = '0';
    historyEl.innerHTML = '';
    messageEl.textContent = '';
    messageEl.className = 'message';
    inputEl.value = '';
    inputEl.disabled = false;
    checkBtn.disabled = false;
    inputEl.focus();
    console.log('Secret:', secretNumber);
}

checkBtn.addEventListener('click', checkGuess);

inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkGuess();
});

newGameBtn.addEventListener('click', newGame);

newGame();
