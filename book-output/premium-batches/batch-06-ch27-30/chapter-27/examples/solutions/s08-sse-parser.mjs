// SSE Frame পড়া: একাধিক data Line জোড়া লাগে, ':' দিয়ে শুরু Line মন্তব্য।
export function parseFrame(frame) {
  const event = { type: 'message', data: [], id: null };
  for (const line of frame.split('\n')) {
    if (line === '' || line.startsWith(':')) continue;
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    const value = colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '');
    if (field === 'data') event.data.push(value);
    if (field === 'event') event.type = value;
    if (field === 'id') event.id = value;
  }
  return event.data.length ? { ...event, data: event.data.join('\n') } : null;
}

const stream = ': ping\n\n'
  + 'id: 7\nevent: booking.status.changed\ndata: {"a":1,\ndata: "b":2}\n\n'
  + 'data: সাধারণ বার্তা\n\n';
for (const frame of stream.split('\n\n')) {
  const event = parseFrame(frame);
  if (event) console.log(event.id, event.type, event.data.replace('\n', ' '));
  else if (frame) console.log('(মন্তব্য বা ফাঁকা Frame বাদ)');
}
