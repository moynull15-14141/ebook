process.on('unhandledRejection', (reason) => {
  console.log(`ধরা পড়েনি: ${reason.message}`);
});

async function saveReport() {
  throw new Error('Disk ভর্তি');
}

saveReport();
console.log('Program চলছে');
