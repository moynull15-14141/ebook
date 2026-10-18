const blob = new Blob(['নাম,শহর\n', 'Sara,Dhaka\n'], { type: 'text/csv' });
console.log(blob.type, blob.size);
console.log((await blob.text()).split('\n')[1]);

const file = new File(['{"ok":true}'], 'result.json', {
  type: 'application/json',
});
console.log(file.name, file.size, JSON.parse(await file.text()).ok);
