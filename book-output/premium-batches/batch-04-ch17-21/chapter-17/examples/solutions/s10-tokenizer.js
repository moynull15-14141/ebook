function tokenize(text) {
  const token = /\s*(?:(?<number>\d+)|(?<op>[+\-*/]))/y;
  const source = text.trimEnd();
  const tokens = [];
  let position = 0;

  while (position < source.length) {
    token.lastIndex = position;
    const match = token.exec(source);
    if (match === null) {
      throw new SyntaxError(`অচেনা অক্ষর, অবস্থান ${position}`);
    }
    tokens.push(match.groups.number ?? match.groups.op);
    position = token.lastIndex;
  }
  return tokens;
}

console.log(tokenize('12 + 3*4'));
try {
  tokenize('12 + x');
} catch (error) {
  console.log(error.message);
}
