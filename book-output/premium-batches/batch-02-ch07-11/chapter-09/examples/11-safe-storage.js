function loadList(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

localStorage.setItem('broken', '{not json');
localStorage.setItem('wrong-shape', '{"a":1}');

console.log(loadList('broken').length);
console.log(loadList('wrong-shape').length);
console.log(loadList('never-saved').length);

localStorage.removeItem('broken');
localStorage.removeItem('wrong-shape');
