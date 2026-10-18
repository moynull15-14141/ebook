const holder = document.createElement('div');
holder.innerHTML = '<img src="data:," onerror="window.handlerRan = true">';
document.body.append(holder);

setTimeout(() => {
  console.log(`Inline script চলেছে? ${window.inlineRan === true}`);
  console.log(`onerror Attribute চলেছে? ${window.handlerRan === true}`);
  console.log('বাইরের File (check.js) চলেছে? true');
}, 200);
