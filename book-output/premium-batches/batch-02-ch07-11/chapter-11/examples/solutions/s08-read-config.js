function readConfig(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Config পড়া যায়নি', { cause: error });
  }
}

try {
  readConfig('port=8080');
} catch (error) {
  console.log(error.message);
  console.log(error.cause instanceof SyntaxError);
}
