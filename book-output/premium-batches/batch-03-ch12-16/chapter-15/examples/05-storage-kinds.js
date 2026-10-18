localStorage.setItem('theme', 'dark');
sessionStorage.setItem('draft', 'অর্ধেক লেখা');

console.log(localStorage.getItem('theme'), sessionStorage.getItem('draft'));
console.log(sessionStorage.length, typeof sessionStorage.key(0));

localStorage.removeItem('theme');
sessionStorage.clear();
console.log(localStorage.getItem('theme'), sessionStorage.length);
