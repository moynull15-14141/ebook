const request = new Request('https://api.example.com/bookmarks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'MDN', url: 'https://developer.mozilla.org/' }),
});

console.log(request.method, request.headers.get('content-type'));
console.log((await request.json()).title);

const response = new Response(JSON.stringify({ id: 7 }), {
  status: 201,
  headers: { 'Content-Type': 'application/json' },
});
console.log(response.status, response.ok, (await response.json()).id);
