const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadProfile() {
  await wait(50);
  throw new Error('Profile Server সাড়া দেয়নি');
}

async function main() {
  console.log('Loading শুরু');
  try {
    await loadProfile();
  } catch (error) {
    console.log(`ব্যর্থ: ${error.message}`);
  } finally {
    console.log('Loading বন্ধ');
  }
}

main();
