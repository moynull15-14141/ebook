const KEY = 'jsm-ch09-settings';

localStorage.setItem(KEY, JSON.stringify({ theme: 'dark', fontSize: 16 }));

const raw = localStorage.getItem(KEY);
console.log(typeof raw);
console.log(JSON.parse(raw).fontSize + 2);

localStorage.setItem('count', 5);
console.log(typeof localStorage.getItem('count'));
console.log(localStorage.getItem('missing'));

localStorage.removeItem(KEY);
localStorage.removeItem('count');
console.log(localStorage.length);
