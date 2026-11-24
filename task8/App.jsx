import { useState } from 'react';
import TodoForm from './components/TodoForm.jsx';
import Filters from './components/Filters.jsx';
import Stats from './components/Stats.jsx';
import TodoList from './components/TodoList.jsx';
import { FILTERS } from './filters.js';

export default function App() {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Разобраться с компонентами', completed: true },
        { id: 2, text: 'Сдать лабораторную 8', completed: false }
    ]);
    const [filterId, setFilterId] = useState('all');

    const addTask = (text, completed) => {
        setTasks((prev) => {
            const id = prev.reduce((max, task) => Math.max(max, task.id), 0) + 1;
            return [...prev, { id, text, completed }];
        });
    };

    const toggleTask = (id) => {
        setTasks((prev) => prev.map((task) => (
            task.id === id ? { ...task, completed: !task.completed } : task
        )));
    };

    const deleteTask = (id) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const currentFilter = FILTERS.find((item) => item.id === filterId);
    const visibleTasks = tasks.filter(currentFilter.test);

    return (
        <main className="page">
            <h1>Список задач</h1>
            <TodoForm onAdd={addTask} />
            <Filters filters={FILTERS} current={filterId} onChange={setFilterId} />
            <Stats tasks={tasks} />
            <TodoList tasks={visibleTasks} onToggle={toggleTask} onDelete={deleteTask} />
        </main>
    );
}
