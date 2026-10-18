import http from 'node:http';

// Server: সাধারণ HTTP Response, যা শেষ হয় না; প্রতিটি Event "\n\n" দিয়ে আলাদা।
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache' });
  const statuses = ['PENDING', 'CONFIRMED', 'TICKETED'];
  statuses.forEach((status, i) => setTimeout(() => {
    res.write(`id: ${i + 1}\nevent: status\ndata: {"status":"${status}"}\n\n`);
    if (i === statuses.length - 1) res.end();
  }, 20 * i));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

// Client: Browser-এ EventSource; এখানে fetch দিয়ে Stream পড়ে নিজেই ভাগ করা।
const res = await fetch(`http://127.0.0.1:${server.address().port}/`);
console.log('Content-Type:', res.headers.get('content-type'));
let buffer = '';
for await (const chunk of res.body.pipeThrough(new TextDecoderStream())) {
  buffer += chunk;
  const frames = buffer.split('\n\n');
  buffer = frames.pop();
  for (const frame of frames) {
    const fields = Object.fromEntries(frame.split('\n')
      .map((line) => [line.slice(0, line.indexOf(':')),
        line.slice(line.indexOf(':') + 2)]));
    console.log(`#${fields.id} ${fields.event}:`, JSON.parse(fields.data));
  }
}
server.close();
