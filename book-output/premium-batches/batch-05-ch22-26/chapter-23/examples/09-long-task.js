const seen = [];
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => seen.push(entry.entryType));
});
observer.observe({ type: 'longtask', buffered: true });

setTimeout(() => {
  const end = performance.now() + 120;
  while (performance.now() < end) {
    // ১২০ ms Main Thread আটকে রাখা (শিক্ষামূলক প্রদর্শন)
  }
}, 50);

setTimeout(() => {
  observer.disconnect();
  console.log(`Long Task ধরা পড়েছে: ${seen.includes('longtask')}`);
}, 500);
