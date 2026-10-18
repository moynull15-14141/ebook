const $ = (selector) => document.querySelector(selector);
let csrf = '';

// CSRF Token শুধু এই Variable-এ (Memory); localStorage-এ নয়।
async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(path, {
    method,
    headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
    body: body && JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    const details = Object.values(data.errors ?? {}).join(', ');
    throw new Error(data.error ?? details);
  }
  return data;
}

// সব লেখা textContent দিয়ে: নোটে HTML থাকলেও তা লেখা হিসেবেই দেখায়।
function renderTrips(trips) {
  $('#trips').replaceChildren(...trips.map((trip) => {
    const item = document.createElement('li');
    item.textContent = `${trip.packageId} · ${trip.travelers} জন · `
      + `${trip.startDate} · ৳${trip.total} · ${trip.note}`;
    return item;
  }));
}

async function showApp(session) {
  csrf = session.csrf;
  $('#login').hidden = true;
  $('#trip').hidden = false;
  $('#status').textContent = `Login: ${session.email} (${session.role})`;
  renderTrips((await api('/api/trips')).trips);
}

$('#login').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const body = { email: $('#email').value, password: $('#password').value };
    $('#password').value = '';
    await showApp(await api('/api/login', { method: 'POST', body }));
  } catch (error) {
    $('#status').textContent = error.message;
  }
});

$('#trip').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const body = {
      packageId: $('#package').value,
      travelers: Number($('#travelers').value),
      startDate: $('#date').value,
      note: $('#note').value,
    };
    const { trip } = await api('/api/trips', { method: 'POST', body });
    $('#status').textContent = `অনুরোধ গৃহীত, মোট ৳${trip.total}`;
    renderTrips((await api('/api/trips')).trips);
  } catch (error) {
    $('#status').textContent = error.message;
  }
});

api('/api/session').then(showApp, () => {});
