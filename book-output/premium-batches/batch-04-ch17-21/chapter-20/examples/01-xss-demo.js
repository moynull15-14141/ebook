const note = '<img src="data:," onerror="window.imgRan = true">';
const scriptNote = '<script>window.scriptRan = true</' + 'script>';

const unsafe = document.createElement('div');
const safe = document.createElement('div');
document.body.append(unsafe, safe);

// শিক্ষামূলক প্রদর্শন: ব্যবহারকারীর লেখা innerHTML-এ (এভাবে করবেন না)।
unsafe.innerHTML = note + scriptNote;
// প্রস্তাবিত প্রতিরক্ষা: লেখা হিসেবে বসানো।
safe.textContent = note;

setTimeout(() => {
  const img = unsafe.querySelector('img');
  console.log(`innerHTML: img Element তৈরি? ${img !== null}`);
  console.log(`innerHTML: onerror চলেছে? ${window.imgRan === true}`);
  console.log(`innerHTML: script চলেছে? ${window.scriptRan === true}`);
  console.log(`textContent: Element তৈরি? ${safe.children.length > 0}`);
}, 300);
