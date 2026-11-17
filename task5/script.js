let sequence = [];
let playerSequence = [];
let level = 0;
let isShowingSequence = false;
let isGameOver = false;
let audioCtx = null;

const FREQUENCIES = [329.63, 261.63, 220.00, 164.81];
const TONE_DURATION = 0.3;

const buttons = document.querySelectorAll('.simon-btn');
const startBtn = document.getElementById('startBtn');
const levelEl = document.getElementById('level');
const messageEl = document.getElementById('message');

function ensureAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(index) {
    ensureAudioContext();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.value = FREQUENCIES[index];

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gain.gain.linearRampToValueAtTime(0, now + TONE_DURATION);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + TONE_DURATION + 0.05);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setButtonsEnabled(enabled) {
    buttons.forEach(function (btn) {
        btn.disabled = !enabled;
    });
}

function activateButton(index) {
    const btn = buttons[index];
    btn.classList.add('active');
    playTone(index);
    setTimeout(function () {
        btn.classList.remove('active');
    }, 400);
}

async function playSequence() {
    isShowingSequence = true;
    setButtonsEnabled(false);
    playerSequence = [];
    messageEl.textContent = 'Запоминайте...';
    messageEl.className = 'message';

    await sleep(800);

    for (let i = 0; i < sequence.length; i++) {
        if (isGameOver) break;
        activateButton(sequence[i]);
        await sleep(600);
    }

    if (!isGameOver) {
        isShowingSequence = false;
        setButtonsEnabled(true);
        messageEl.textContent = 'Ваш ход!';
        messageEl.className = 'message success';
    }
}

function handlePlayerClick(index) {
    if (isGameOver) return;
    if (isShowingSequence) return;

    activateButton(index);
    playerSequence.push(index);

    const currentIndex = playerSequence.length - 1;

    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        isGameOver = true;
        isShowingSequence = false;
        setButtonsEnabled(false);
        messageEl.textContent = 'Вы дошли до уровня ' + level;
        messageEl.className = 'message error';
        startBtn.disabled = false;
        return;
    }

    if (playerSequence.length === sequence.length) {
        level++;
        levelEl.textContent = level;
        messageEl.textContent = 'Верно!';

        setTimeout(function () {
            messageEl.textContent = '';
            sequence.push(Math.floor(Math.random() * 4));
            playSequence();
        }, 1000);
    }
}

function startGame() {
    ensureAudioContext();
    sequence = [];
    playerSequence = [];
    level = 0;
    isGameOver = false;
    isShowingSequence = false;
    levelEl.textContent = '0';
    messageEl.textContent = '';
    messageEl.className = 'message';
    startBtn.disabled = true;
    setButtonsEnabled(false);

    sequence.push(Math.floor(Math.random() * 4));
    playSequence();
}

buttons.forEach(function (btn, index) {
    btn.addEventListener('click', function () {
        handlePlayerClick(index);
    });
});

startBtn.addEventListener('click', startGame);

setButtonsEnabled(false);
