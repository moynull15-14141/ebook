const completeAll = (tasks) => tasks.map((task) => ({ ...task, done: true }));

const tasks = [
  { id: '1', title: 'বাজার', done: false },
  { id: '2', title: 'বই', done: true },
];
const next = completeAll(tasks);

console.log(next.map((task) => task.done).join(', '));
console.log(tasks[0].done);
console.log(next[0] === tasks[0]);
