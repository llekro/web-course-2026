export const FILTERS = [
    { id: 'all', label: 'Все', test: () => true },
    { id: 'active', label: 'Активные', test: (task) => !task.completed },
    { id: 'completed', label: 'Завершённые', test: (task) => task.completed }
];
