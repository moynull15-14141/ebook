function safeHref(url) {
  try {
    const parsed = new URL(url, 'https://trip.example');
    return ['https:', 'http:'].includes(parsed.protocol) ? url : '#';
  } catch {
    return '#';
  }
}

const inputs = ['https://ok.example/a', '/trips/7', 'JavaScript:alert(1)',
  ' javascript:void(0)', 'data:text/html,hi', 'http://[bad'];
console.log(inputs.map(safeHref).join(' | '));
