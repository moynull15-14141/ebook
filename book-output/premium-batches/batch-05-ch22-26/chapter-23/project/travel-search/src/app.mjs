import { visibleRange, offsetOf } from './virtual.mjs';

const ROW_HEIGHT = 48;
const $ = (selector) => document.querySelector(selector);
const worker = new Worker(new URL('./search-worker.mjs', import.meta.url),
  { type: 'module' });
let rows = [];
let latestRequest = 0;
let frame = 0;
let timer;

// শুধু দৃশ্যমান সারি (এবং দুই পাশে কয়েকটি বাড়তি) DOM-এ।
function render() {
  frame = 0;
  const list = $('#list');
  const { start, end } = visibleRange({
    scrollTop: list.scrollTop, viewport: list.clientHeight,
    rowHeight: ROW_HEIGHT, total: rows.length,
  });
  $('#spacer').style.height = `${rows.length * ROW_HEIGHT}px`;
  $('#rows').style.transform = `translateY(${offsetOf(start, ROW_HEIGHT)}px)`;
  $('#rows').replaceChildren(...rows.slice(start, end).map((r) => {
    const item = document.createElement('li');
    item.textContent = `${r.title} · ${r.place} · ৳${r.price} · ${r.rating}`;
    return item;
  }));
}

function search() {
  latestRequest += 1;
  worker.postMessage({
    requestId: latestRequest,
    query: $('#query').value,
    options: { sort: $('#sort').value },
  });
}

worker.addEventListener('message', ({ data }) => {
  if (data.type === 'ready') {
    $('#status').textContent = `${data.total}টি প্যাকেজ প্রস্তুত`;
    search();
    return;
  }
  // ধীর পুরোনো উত্তর নতুন উত্তরকে মুছে দেবে না।
  if (data.requestId !== latestRequest) {
    return;
  }
  rows = data.rows;
  $('#list').scrollTop = 0;
  render();
  $('#count').textContent = `${rows.length}টি ফল · খোঁজ ${data.ms.toFixed(1)} ms`;
  $('#count').dataset.request = String(data.requestId);
});

$('#query').addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(search, 150);
});
$('#sort').addEventListener('change', search);
// একটি Frame-এ একবারই আঁকা, যত Scroll Event-ই আসুক।
$('#list').addEventListener('scroll', () => {
  frame ||= requestAnimationFrame(render);
}, { passive: true });
