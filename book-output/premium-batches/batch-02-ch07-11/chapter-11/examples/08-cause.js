function loadSettings(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Settings পড়া যায়নি', { cause: error });
  }
}

try {
  loadSettings('{oops');
} catch (error) {
  console.log(error.message);
  console.log(`মূল কারণ: ${error.cause.name}`);
}
