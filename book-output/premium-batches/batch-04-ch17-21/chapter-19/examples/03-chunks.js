const items = Array.from({ length: 300000 }, (_, i) => i);
const work = (n) => Math.sqrt(n) * Math.sin(n);

function blocking() {
  let timerRan = false;
  setTimeout(() => {
    timerRan = true;
  }, 0);
  let total = 0;
  for (const n of items) {
    total += work(n);
  }
  return { timerRan, total };
}

async function chunked(size = 20000) {
  let timerRan = false;
  setTimeout(() => {
    timerRan = true;
  }, 0);
  let total = 0;
  let chunks = 0;
  for (let i = 0; i < items.length; i += size) {
    for (const n of items.slice(i, i + size)) {
      total += work(n);
    }
    chunks += 1;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return { timerRan, total, chunks };
}

const a = blocking();
console.log(`একটানা: কাজ চলাকালীন Timer চলেছে? ${a.timerRan}`);
const b = await chunked();
console.log(`টুকরোয়: Timer চলেছে? ${b.timerRan}, টুকরো ${b.chunks}`);
console.log(`একই ফল? ${Math.abs(a.total - b.total) < 1e-6}`);
