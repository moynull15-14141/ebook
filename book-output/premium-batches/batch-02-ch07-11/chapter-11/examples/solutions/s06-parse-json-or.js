function parseJsonOr(text, fallback) {
  try {
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return fallback;
    }
    throw error;
  }
}

console.log(parseJsonOr('{"theme":"dark"}', {}).theme);
console.log(parseJsonOr('{broken', { theme: 'light' }).theme);
