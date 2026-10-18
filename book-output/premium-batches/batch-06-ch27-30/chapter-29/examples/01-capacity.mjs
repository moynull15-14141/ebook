// Capacity Planning: অনুমান নয়, হিসাব। সংখ্যাগুলো শুরুর অনুমান, পরে মেপে বদলাবে।
const dailyRequests = 86_400;
const peakMultiplier = 20; // সন্ধ্যার Sale-এ গড়ের ২০ গুণ
const latencySeconds = 0.25; // একটি অনুরোধে গড় সময়
const queriesPerRequest = 4;
const cacheHitRate = 0.6;

const avgRps = dailyRequests / (24 * 60 * 60);
const peakRps = avgRps * peakMultiplier;
// Little's Law: একসঙ্গে চলমান অনুরোধ = আগমনের হার x গড় সময়
const concurrent = peakRps * latencySeconds;
const dbQps = peakRps * queriesPerRequest * (1 - cacheHitRate);

console.log({ avgRps, peakRps, concurrent, dbQps });
// Retry Amplification: Payment ব্যর্থ হলে প্রতিটি অনুরোধ ৩ বার চেষ্টা করে
console.log('ব্যর্থতার সময় Payment-এ অনুরোধ/সেকেন্ড:', peakRps * 3);
