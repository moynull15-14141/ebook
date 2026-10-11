'use strict';

// নাম থেকে শুভেচ্ছা-বার্তা তৈরি করে। নাম ফাঁকা হলে ফাঁকা String ফেরত দেয়।
function createGreeting(name) {
  const cleanName = name.trim();

  if (cleanName === '') {
    return '';
  }

  return `স্বাগতম, ${cleanName}! JavaScript শেখার যাত্রা শুরু হোক।`;
}

const form = document.querySelector('#greeting-form');
const nameInput = document.querySelector('#name');
const message = document.querySelector('#message');

// Form Submit হলে (Button Click অথবা Enter) এই Function চলে।
function handleSubmit(event) {
  event.preventDefault();

  const greeting = createGreeting(nameInput.value);

  if (greeting === '') {
    message.textContent = 'অনুগ্রহ করে আপনার নাম লিখুন।';
    message.className = 'message error';
    nameInput.focus();
    return;
  }

  message.textContent = greeting;
  message.className = 'message success';
}

form.addEventListener('submit', handleSubmit);
