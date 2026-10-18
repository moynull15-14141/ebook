localStorage.setItem('visits', 41);

const raw = localStorage.getItem('visits');
const visits = Number(raw) + 1;

console.log(typeof raw, raw + 1, visits);
localStorage.removeItem('visits');
