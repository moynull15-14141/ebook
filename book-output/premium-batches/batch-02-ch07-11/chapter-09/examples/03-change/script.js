const message = document.querySelector('#message');
const help = document.querySelector('#help');

message.textContent = 'সংরক্ষিত হয়েছে';
message.classList.add('success');
message.classList.remove('note');
message.classList.toggle('bold');

help.setAttribute('href', 'https://developer.mozilla.org');
help.hidden = true;

console.log(message.textContent);
console.log(message.className);
console.log(message.classList.contains('note'));
console.log(help.getAttribute('href'));
console.log(help.hidden);
