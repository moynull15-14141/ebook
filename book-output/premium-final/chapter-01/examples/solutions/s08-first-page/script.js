const pageTitle = document.querySelector('#page-title');
const statusText = document.querySelector('#status');
const changeButton = document.querySelector('#change-button');

function showMessage() {
  pageTitle.textContent = 'JavaScript শেখা চলছে';
  statusText.textContent = 'Button চাপা হয়েছে। JavaScript কাজ করছে!';
}

changeButton.addEventListener('click', showMessage);
