const userText = 'Hello <img src="" onerror="console.log(\'XSS: Code চলে গেছে!\')">';

const unsafe = document.createElement('p');
unsafe.innerHTML = userText;

const safe = document.createElement('p');
safe.textContent = userText;

console.log(safe.innerHTML);
console.log(safe.children.length, unsafe.children.length);
