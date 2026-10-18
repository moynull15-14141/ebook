import { greet } from './greeting.mjs';

const title = document.querySelector('#title');
title.textContent = greet('Sara');

console.log(title.textContent);
console.log(typeof greet, typeof window.greet);
