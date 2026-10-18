// তিন স্তর (Gateway, Booking, Payment Client), প্রতিটি নিজে ৩ বার চেষ্টা করে।
// নিচের Service পুরো বন্ধ থাকলে একটি ব্যবহারকারী-অনুরোধ কতগুলো ডাক তৈরি করে?
function callsToBottom(layers, attemptsPerLayer) {
  return attemptsPerLayer ** layers;
}

for (const attempts of [1, 2, 3]) {
  const calls = callsToBottom(3, attempts);
  console.log(`প্রতি স্তরে ${attempts} চেষ্টা: ${calls}টি ডাক`);
}
// সমাধান: Retry শুধু এক স্তরে (সাধারণত নিচের Client-এ), বাকিরা দ্রুত ব্যর্থ।
console.log('শুধু নিচের স্তরে ৩ চেষ্টা:', 1 * 1 * 3, 'টি ডাক');
// আর Circuit Breaker খুললে পরের অনুরোধগুলো নিচে পৌঁছায়ই না।
const peakRps = 200;
console.log('৩^৩ হলে বন্ধ Service-এ অনুরোধ/সেকেন্ড:', peakRps * 27);
