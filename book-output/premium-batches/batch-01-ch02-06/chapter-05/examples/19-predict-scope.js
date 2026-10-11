const label = 'বাইরের';

function show() {
  return label;
}

function run() {
  const label = 'ভেতরের';
  return show();
}

console.log(run());
