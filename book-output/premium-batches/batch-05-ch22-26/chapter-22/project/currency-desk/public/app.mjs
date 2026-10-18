const $ = (selector) => document.querySelector(selector);
const money = (minor, currency) => {
  const options = { minimumFractionDigits: 2 };
  return `${(minor / 100).toLocaleString('en-US', options)} ${currency}`;
};

$('#quote-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = {
    from: $('#from').value.trim().toUpperCase(),
    to: $('#to').value.trim().toUpperCase(),
    amount: $('#amount').value,
  };
  const response = await fetch('/api/quotes', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  $('#result').dataset.state = response.ok ? 'ok' : 'error';
  $('#result').textContent = response.ok
    ? `দেবেন ${money(data.payable, data.from)}`
      + ` (Fee ${money(data.fee, data.from)}),`
      + ` পাবেন ${money(data.receives, data.to)}`
    : data.error;
});
