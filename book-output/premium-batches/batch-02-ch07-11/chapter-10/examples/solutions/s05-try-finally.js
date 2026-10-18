async function loadReport() {
  throw new Error('Report পাওয়া যায়নি');
}

async function main() {
  try {
    await loadReport();
    console.log('এটি চলবে না');
  } catch (error) {
    console.log(`ধরা পড়েছে: ${error.message}`);
  } finally {
    console.log('Loading বন্ধ');
  }
}

main();
