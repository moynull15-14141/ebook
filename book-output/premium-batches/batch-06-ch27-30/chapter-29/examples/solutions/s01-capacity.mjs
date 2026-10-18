// ৪,৩২,০০০ দৈনিক অনুরোধ; Peak গড়ের ১০ গুণ; প্রতি অনুরোধ ২০০ ms।
const daily = 432_000;
const avg = daily / 86_400;
const peak = avg * 10;
const concurrent = peak * 0.2; // Little's Law

console.log(`গড়: ${avg} RPS, Peak: ${peak} RPS`);
console.log(`একসঙ্গে চলমান অনুরোধ (Peak): ${concurrent}`);
// প্রতি Instance নিরাপদে ২০টি একসঙ্গে সামলায়; একটি নষ্ট হলেও চলতে হবে (N+1)
const perInstance = 20;
const instances = Math.ceil(concurrent / perInstance) + 1;
console.log(`Instance: ${instances} (একটি অতিরিক্ত, ব্যর্থতার জন্য)`);
