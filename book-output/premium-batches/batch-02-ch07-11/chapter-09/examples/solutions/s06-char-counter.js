const LIMIT = 120;
const field = document.createElement('textarea');
const counter = document.createElement('p');
field.id = 'note';
document.body.append(field, counter);

function updateCounter() {
  const used = field.value.length;
  counter.textContent = `${used}/${LIMIT}`;
  counter.classList.toggle('over', used > LIMIT);
  console.log(counter.textContent);
}

field.addEventListener('input', updateCounter);
updateCounter();
