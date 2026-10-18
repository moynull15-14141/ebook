function startClock(onTick) {
  const id = setInterval(onTick, 50);
  return () => clearInterval(id);
}

let ticks = 0;
const stop = startClock(() => {
  ticks += 1;
});

setTimeout(() => {
  stop();
  const seen = ticks;
  setTimeout(() => console.log(`বন্ধের পর নতুন টিক: ${ticks - seen}`), 150);
}, 120);
