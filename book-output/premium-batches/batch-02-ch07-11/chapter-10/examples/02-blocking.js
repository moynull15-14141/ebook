const start = Date.now();

setTimeout(() => {
  const late = Date.now() - start >= 200 ? 'কমপক্ষে 200 ms' : 'কম';
  console.log(`Timer চলল, দেরি ${late}`);
}, 0);

while (Date.now() - start < 200) {
  // 200 ms ধরে শুধু ঘুরছে
}

console.log('Loop শেষ');
