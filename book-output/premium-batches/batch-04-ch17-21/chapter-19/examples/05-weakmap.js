const metadata = new WeakMap();

function track(element) {
  const info = metadata.get(element) ?? { clicks: 0 };
  info.clicks += 1;
  metadata.set(element, info);
  return info.clicks;
}

let button = { id: 'save' };
track(button);
console.log(track(button), metadata.has(button));

button = null;
console.log(metadata.has({ id: 'save' }));
console.log(typeof metadata.size, typeof metadata.keys);
