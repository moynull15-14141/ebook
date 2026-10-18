// ১০০০ জন Operator, ১ ঘণ্টা, আর ঘণ্টায় মাত্র ৪০টি আসল পরিবর্তন।
const clients = 1000;
const seconds = 60 * 60;
const changes = 40;

function polling(intervalSeconds) {
  const requests = clients * Math.floor(seconds / intervalSeconds);
  const useful = clients * changes;
  return { requests, wasted: requests - useful,
    averageDelay: intervalSeconds / 2 };
}

console.log('Polling ৫ সেকেন্ড:', polling(5));
console.log('Polling ৬০ সেকেন্ড:', polling(60));
// Push (SSE/WebSocket): প্রতিটি পরিবর্তন একবার প্রতিটি Client-এ।
console.log('Push:', { messages: clients * changes, averageDelay: 0 });
