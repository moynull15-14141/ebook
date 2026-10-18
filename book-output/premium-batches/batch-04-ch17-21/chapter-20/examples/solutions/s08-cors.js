const ALLOWED = new Set([
  'https://app.trip.example',
  'https://admin.trip.example',
]);

function corsHeaders(origin) {
  if (!ALLOWED.has(origin)) {
    return {};
  }
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
    vary: 'Origin',
  };
}

console.log(corsHeaders('https://app.trip.example'));
console.log(corsHeaders('https://app.trip.example.evil.test'));
console.log(corsHeaders(undefined));
