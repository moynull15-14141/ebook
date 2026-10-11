"use strict";
const nameInput = document.querySelector('#name');
const greetButton = document.querySelector('#greet');
const result = document.querySelector('#result');
function greeting(name) {
  const cleanName = name.trim();
  return cleanName ? `স্বাগতম, ${cleanName}! JavaScript শেখা শুরু হোক।` : 'অনুগ্রহ করে তোমার নাম লিখো।';
}
greetButton.addEventListener('click', () => { result.textContent = greeting(nameInput.value); });
nameInput.addEventListener('keydown', event => { if (event.key === 'Enter') greetButton.click(); });
