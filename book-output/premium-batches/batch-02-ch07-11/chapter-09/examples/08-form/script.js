const form = document.querySelector('#signup');
const email = document.querySelector('#email');
const error = document.querySelector('#error');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = email.value.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error.textContent = 'সঠিক একটি Email লিখুন।';
    email.setAttribute('aria-invalid', 'true');
    console.log(`ত্রুটি: "${value}"`);
    return;
  }

  error.textContent = '';
  email.removeAttribute('aria-invalid');
  console.log(`পাঠানো হলো: ${value}`);
  form.reset();
});
