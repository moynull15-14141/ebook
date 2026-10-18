const button = document.createElement('button');
button.id = 'go';
button.textContent = 'চাপুন';
document.body.append(button);

const controller = new AbortController();
let clicks = 0;

button.addEventListener('click', () => {
  clicks += 1;
  console.log(`Click ${clicks}`);
  controller.abort();
}, { signal: controller.signal });
