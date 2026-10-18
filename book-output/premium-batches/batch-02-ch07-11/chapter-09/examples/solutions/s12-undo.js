function deleteWithUndo(tasks, id) {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return { tasks, undo: null };
  }

  const removed = tasks[index];
  const undo = (current) => [
    ...current.slice(0, index),
    removed,
    ...current.slice(index),
  ];

  return { tasks: tasks.filter((task) => task.id !== id), undo };
}

const start = [
  { id: 'a', title: 'ক' },
  { id: 'b', title: 'খ' },
  { id: 'c', title: 'গ' },
];
const { tasks, undo } = deleteWithUndo(start, 'b');

console.log(tasks.map((task) => task.title).join(''));
console.log(undo(tasks).map((task) => task.title).join(''));
console.log(deleteWithUndo(start, 'x').undo);
