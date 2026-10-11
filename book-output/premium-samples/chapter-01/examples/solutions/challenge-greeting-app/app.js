'use strict';

// অনুশীলনী ১২: নাম ও শহর—দুটি তথ্য থেকে শুভেচ্ছা তৈরি।
function createGreeting(name, city) {
  const cleanName = name.trim();
  const cleanCity = city.trim();

  if (cleanName === '') {
    return '';
  }

  if (cleanCity === '') {
    return `স্বাগতম, ${cleanName}!`;
  }

  return `স্বাগতম, ${cleanName}! ${cleanCity} থেকে JavaScript শেখার যাত্রা শুরু হোক।`;
}

const form = document.querySelector('#greeting-form');
const nameInput = document.querySelector('#name');
const cityInput = document.querySelector('#city');
const message = document.querySelector('#message');
const counter = document.querySelector('#counter');
const resetButton = document.querySelector('#reset-button');
let greetingCount = 0;

function handleSubmit(event) {
  event.preventDefault();

  const greeting = createGreeting(nameInput.value, cityInput.value);

  if (greeting === '') {
    message.textContent = 'অনুগ্রহ করে আপনার নাম লিখুন।';
    message.className = 'message error';
    nameInput.focus();
    return;
  }

  message.textContent = greeting;
  message.className = 'message success';

  // অনুশীলনী ১০: সফল শুভেচ্ছার সংখ্যা গণনা।
  greetingCount = greetingCount + 1;
  counter.textContent = `মোট শুভেচ্ছা: ${greetingCount} বার`;
}

// অনুশীলনী ১১: Input ও বার্তা মুছে ফেলা।
function handleReset() {
  nameInput.value = '';
  cityInput.value = '';
  message.textContent = '';
  message.className = 'message';
  nameInput.focus();
}

form.addEventListener('submit', handleSubmit);
resetButton.addEventListener('click', handleReset);
