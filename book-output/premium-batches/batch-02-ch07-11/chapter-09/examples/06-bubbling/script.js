const card = document.querySelector('#card');
const like = document.querySelector('#like');

like.addEventListener('click', (event) => {
  console.log(`like: ${event.type}`);
});

card.addEventListener('click', (event) => {
  console.log(`card: target ${event.target.tagName}`);
});

document.addEventListener('click', () => {
  console.log('document');
});
