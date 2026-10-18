const countView = document.querySelector('#count');
let count = 0;

function show() {
  countView.textContent = count;
  console.log(`গণনা: ${count}`);
}

document.querySelector('#add').addEventListener('click', () => {
  count += 1;
  show();
});

document.querySelector('#reset').addEventListener('click', () => {
  count = 0;
  show();
});
