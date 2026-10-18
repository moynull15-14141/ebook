const text = JSON.stringify({ hello: 'world' });
const blob = new Blob([text], { type: 'application/json' });
const link = document.createElement('a');

link.href = URL.createObjectURL(blob);
link.download = 'data.json';
link.click();

setTimeout(() => URL.revokeObjectURL(link.href), 1000);
