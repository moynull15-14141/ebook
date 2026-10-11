const statusText = document.querySelector('#status');
const changeButton = document.querySelector('#change-button');

function showMessage() {
  statusText.textContent = 'Button চাপা হয়েছে। JavaScript কাজ করছে!';
}

changeButton.addEventListener('click', showMessage);
console.log('script.js সফলভাবে Load হয়েছে।');
