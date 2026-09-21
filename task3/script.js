let tasks = [];
let currentFilter = 'all';
let idCounter = 1;

const input = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('taskList');
const leftSpan = document.getElementById('leftCount');
const doneSpan = document.getElementById('doneCount');
const filterBtns = document.querySelectorAll('.filter-btn');

function addTask() {
    let text = input.value.trim();
    if (text === '') {
        input.style.borderColor = '#e74c3c';
        setTimeout(() => input.style.borderColor = '#d0d5dd', 1500);
        return;
    }

    let task = {
        id: idCounter,
        text: text,
        completed: false
    };
    idCounter++;
    tasks.push(task);
    input.value = '';
    draw();
}

function removeTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    draw();
}

function toggleTask(id) {
    let task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        draw();
    }
}

function updateStats() {
    let done = tasks.filter(t => t.completed).length;
    let left = tasks.length - done;
    leftSpan.textContent = left;
    doneSpan.textContent = done;
}

function draw() {
    list.innerHTML = '';

    let visible = tasks.filter(t => {
        if (currentFilter === 'active') return !t.completed;
        if (currentFilter === 'completed') return t.completed;
        return true;
    });

    visible.map(t => {
        let li = document.createElement('li');
        li.className = 'task';
        if (t.completed) li.classList.add('done');

        let check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'task-check';
        check.checked = t.completed;
        check.addEventListener('change', () => toggleTask(t.id));

        let span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = t.text;

        let del = document.createElement('button');
        del.className = 'task-delete';
        del.textContent = 'Удалить';
        del.addEventListener('click', () => removeTask(t.id));

        li.appendChild(check);
        li.appendChild(span);
        li.appendChild(del);
        list.appendChild(li);
    });

    updateStats();
}

addBtn.addEventListener('click', addTask);

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        draw();
    });
});

draw();
