// Server-Sent Events: একমুখী (Server থেকে Client) সাধারণ HTTP Stream।
// Browser পুনঃসংযোগে নিজেই Last-Event-ID পাঠায়; তা দিয়ে Replay।
export function streamBooking(req, res, { hub, user, bookingId,
  heartbeatMs = 15_000 }) {
  const lastId = Number.parseInt(req.headers['last-event-id'] ?? '0', 10);
  const write = (event) => res.write(
    `id: ${event.sequence}\nevent: ${event.type}\n`
    + `data: ${JSON.stringify(event)}\n\n`);
  const result = hub.subscribe(user.id, bookingId, write, {
    afterSequence: Number.isInteger(lastId) ? lastId : 0,
    onClose: () => res.end(),
  });
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('retry: 3000\n\n');
  if (result.mode === 'snapshot') {
    res.write(`event: snapshot\ndata: ${JSON.stringify(result.snapshot)}\n\n`);
  } else {
    result.events.forEach(write);
  }
  // Comment Line (':' দিয়ে শুরু) Proxy-কে জানায় Connection জীবিত।
  const timer = setInterval(() => res.write(': ping\n\n'), heartbeatMs);
  req.on('close', () => {
    clearInterval(timer);
    result.unsubscribe();
  });
}
