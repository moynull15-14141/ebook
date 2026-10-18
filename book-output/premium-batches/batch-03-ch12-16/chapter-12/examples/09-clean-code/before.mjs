function calc(o) {
  let r = 0;
  if (o) {
    if (o.items.length > 0) {
      for (const i of o.items) {
        r += i.p * i.q;
      }
      if (r > 2000) {
        r = r - r * 0.05;
      } else {
        r = r + 60;
      }
    }
  }
  return r;
}

console.log(calc({ items: [{ p: 250, q: 4 }, { p: 1850, q: 1 }] }));
console.log(calc({ items: [{ p: 120, q: 2 }] }));
