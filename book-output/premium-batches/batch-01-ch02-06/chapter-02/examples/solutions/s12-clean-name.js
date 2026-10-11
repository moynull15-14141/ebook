function cleanName(text) {
  const clean = text.trim();

  if (clean === '') {
    return null;
  }

  return clean;
}

console.log(cleanName('  Sara  '));
console.log(cleanName('     '));
