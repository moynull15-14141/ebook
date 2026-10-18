const response = await fetch('links.json');
console.log(response.status, response.headers.get('content-type'));

const links = await response.json();
console.log(links.map((link) => link.title).join(', '));
console.log(new URL('links.json', location.href).pathname);
