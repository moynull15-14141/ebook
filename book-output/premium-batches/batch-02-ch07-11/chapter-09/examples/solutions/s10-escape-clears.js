const search = document.createElement('input');
search.id = 'search';
document.body.append(search);

search.addEventListener('input', () => {
  console.log(`খুঁজছেন: ${search.value}`);
});

search.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    search.value = '';
    console.log('খোঁজা মুছে ফেলা হলো');
  }
});
