function createRateLimiter(limit, windowMs, clock = Date.now) {
  let times = [];

  return () => {
    const now = clock();
    times = times.filter((time) => now - time < windowMs);
    if (times.length >= limit) {
      return false;
    }
    times = [...times, now];
    return true;
  };
}

let fakeNow = 0;
const allow = createRateLimiter(2, 1000, () => fakeNow);

const results = [allow(), allow(), allow()];
fakeNow = 1000;
results.push(allow());
console.log(results.join(', '));
