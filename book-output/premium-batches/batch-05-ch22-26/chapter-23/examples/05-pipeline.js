const box = document.createElement('div');
box.style.height = '50px';
const next = document.createElement('p');
next.textContent = 'পরের অংশ';
document.body.append(box, next);

const before = next.offsetTop;
box.style.transform = 'translateY(100px)';
const afterTransform = next.offsetTop;
box.style.height = '150px';
const afterHeight = next.offsetTop;

console.log(`transform-এর পর পরের অংশ সরেছে? ${afterTransform !== before}`);
console.log(`height-এর পর সরেছে? ${afterHeight !== before}, ${afterHeight - before}px`);
