import { startDesk } from './src/start.mjs';

// শুধু 127.0.0.1-এ; হারগুলো কাল্পনিক নমুনা, বাস্তব বিনিময় হার নয়।
const desk = await startDesk();
console.log(`CurrencyDesk (শিক্ষামূলক Demo): ${desk.url}`);
console.log('বন্ধ করতে Ctrl+C চাপুন।');

process.on('SIGINT', async () => {
  await desk.close();
  process.exit(0);
});
