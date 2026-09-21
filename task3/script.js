let todos = [];
let currentFilter = 'all';
let nextId = 1;

function init() {
    const todoInput = document.getElementById('todoInput');
    const addBtn = document.getElementById('addBtn');
    const todoList = document.getElementById('todoList');
    const remainingSpan = document.getElementById('remaining');
    const completedSpan = document.getElementById('completed');
    const filterBtns = document.querySelectorAll('.filter-btn');

    function addTodo() {
        const text = todoInput.value.trim();
        
        if (text === '') {
            alert('Введите текст задачи!');
            return;
        }
        
        const todo = {
            id: nextId++,
            text: text,
            completed: false
        };
        
        todos.push(todo);
        todoInput.value = '';
        render();
    }

    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        render();
    }

    function toggleTodo(id) {
        const todo = todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            render();
        }
    }

    function updateCounter() {
        const completed = todos.filter(todo => todo.completed).length;
        const remaining = todos.length - completed;
        
        remainingSpan.textContent = remaining;
        completedSpan.textContent = completed;
    }

    function render() {
        todoList.innerHTML = '';
        
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'active') {
                return !todo.completed;
            } else if (currentFilter === 'completed') {
                return todo.completed;
            }
            return true;
        });
        
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            if (todo.completed) {
                li.classList.add('completed');
            }
            li.dataset.id = todo.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => toggleTodo(todo.id));
            
            const span = document.createElement('span');
            span.className = 'todo-text';
            span.textContent = todo.text;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Удалить';
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
            
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            
            todoList.appendChild(li);
        });
        
        updateCounter();
    }

    addBtn.addEventListener('click', addTodo);

    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            render();
        });
    });

    render();
}

document.addEventListener('DOMContentLoaded', init);
