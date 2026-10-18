const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log('১');
wait(300).then(() => console.log('২'));
