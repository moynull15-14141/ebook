window.addEventListener('unhandledrejection', (event) => {
  console.log(`ধরা পড়েনি এমন Promise: ${event.reason.message}`);
  event.preventDefault();
});

async function saveDraft() {
  throw new Error('Server বন্ধ');
}

saveDraft();
console.log('saveDraft() ডাকা হয়েছে, কিন্তু await বা catch নেই');
