let secretNumber = '';
let attempts = 0;
let history = [];
let gameOver = false;

const inputEl = document.getElementById('guessInput');
const checkBtn = document.getElementById('checkBtn');
const newGameBtn = document.getElementById('newGameBtn');
const attemptsEl = document.getElementById('attempts');
const historyEl = document.getElementById('history');
const messageEl = document.getElementById('message');

function generateNumber() {
    let number = '';
    while (number.length < 4) {
        let digit = String(Math.floor(Math.random() * 10));
        if (number.indexOf(digit) === -1) {
            number = number + digit;
        }
    }
    return number;
}

function validateInput(value) {
    if (value.length !== 4) {
        return 'Введите ровно 4 цифры';
    }
    for (let i = 0; i < 4; i++) {
        if (value[i] < '0' || value[i] > '9') {
            return 'Можно вводить только цифры от 0 до 9';
        }
    }
    return '';
}

function hasSameDigits(value) {
    for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
            if (value[i] === value[j]) {
                return true;
            }
        }
    }
    return false;
}

function countBullsAndCows(guess) {
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < 4; i++) {
        if (guess[i] === secretNumber[i]) {
            bulls = bulls + 1;
        } else if (secretNumber.indexOf(guess[i]) !== -1) {
            cows = cows + 1;
        }
    }
    return { bulls: bulls, cows: cows };
}

function bullsWord(n) {
    if (n === 1) return 'бык';
    if (n >= 2 && n <= 4) return 'быка';
    return 'быков';
}

function cowsWord(n) {
    if (n === 1) return 'корова';
    if (n >= 2 && n <= 4) return 'коровы';
    return 'коров';
}

function attemptsWord(n) {
    if (n === 1) return 'попытку';
    if (n >= 2 && n <= 4) return 'попытки';
    return 'попыток';
}

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
}

function renderHistory() {
    historyEl.innerHTML = '';
    for (let i = 0; i < history.length; i++) {
        let item = history[i];

        let row = document.createElement('div');
        row.className = 'history-item';

        let num = document.createElement('span');
        num.className = 'history-number';
        num.textContent = item.guess;

        let result = document.createElement('span');
        result.textContent = item.bulls + ' ' + bullsWord(item.bulls) + ', ' +
            item.cows + ' ' + cowsWord(item.cows);

        row.appendChild(num);
        row.appendChild(result);
        historyEl.appendChild(row);
    }
}

function checkGuess() {
    if (gameOver) return;

    let guess = inputEl.value.trim();
    let error = validateInput(guess);
    let sameDigits = hasSameDigits(guess);

    if (error === '' && sameDigits) {
        error = 'Все цифры должны быть разными';
    }

    if (error !== '') {
        showMessage(error, 'error');
        if (sameDigits) {
            inputEl.value = '';
        }
        inputEl.focus();
        return;
    }

    showMessage('', '');
    attempts = attempts + 1;
    attemptsEl.textContent = attempts;

    let result = countBullsAndCows(guess);
    history.push({ guess: guess, bulls: result.bulls, cows: result.cows });
    renderHistory();

    inputEl.value = '';
    inputEl.focus();

    if (result.bulls === 4) {
        gameOver = true;
        showMessage('Победа! Угадано за ' + attempts + ' ' + attemptsWord(attempts), 'success');
        inputEl.disabled = true;
        checkBtn.disabled = true;
    }
}

function newGame() {
    secretNumber = generateNumber();
    attempts = 0;
    history = [];
    gameOver = false;

    attemptsEl.textContent = '0';
    historyEl.innerHTML = '';
    showMessage('', '');
    inputEl.value = '';
    inputEl.disabled = false;
    checkBtn.disabled = false;
    inputEl.focus();
}

checkBtn.addEventListener('click', checkGuess);

inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

newGameBtn.addEventListener('click', newGame);

newGame();
