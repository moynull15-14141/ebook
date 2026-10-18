function isSafeLink(text) {
  try {
    return new URL(text).protocol === 'https:';
  } catch {
    return false;
  }
}

console.log(isSafeLink('https://example.com'), isSafeLink('http://example.com'));
console.log(isSafeLink('javascript:alert(1)'), isSafeLink('example.com'));
