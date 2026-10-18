// Token শুধু Memory-তে (Page Reload-এ Logout)। localStorage-এ রাখলে কোনো XSS
// Script তা পড়তে পারত; Production-এ HttpOnly Cookie + CSRF সুরক্ষা ভালো।
const state = { token: null, user: null, pendingKey: null, busy: false };
const $ = (selector) => document.querySelector(selector);
const MESSAGES = {
  SOLD_OUT: 'দুঃখিত, এত আসন খালি নেই।',
  EMAIL_TAKEN: 'এই Email আগেই নিবন্ধিত।',
  KEY_CONFLICT: 'আগের অনুরোধের সঙ্গে মিলছে না; আবার চেষ্টা করুন।',
  TOO_MANY_ATTEMPTS: 'অনেকবার ভুল হয়েছে; কিছুক্ষণ পরে চেষ্টা করুন।',
};

function say(text, isError = false) {
  $('#message').textContent = text;
  $('#message').classList.toggle('error', isError);
}

// সব API ডাক এক জায়গায়: Token, JSON, Error-এর বার্তা।
async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(path, { method, headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(state.token && { Authorization: `Bearer ${state.token}` }) },
    body: body && JSON.stringify(body) });
  } catch {
    throw new Error('Network সমস্যা; সংযোগ দেখে আবার চেষ্টা করুন।');
  }
  const payload = await res.json();
  if (res.ok) return payload.data;
  const { code, message, details } = payload.error;
  // Login থাকা অবস্থায় 401 মানে Session শেষ; Login Form-এ তা ভুল Password।
  if (code === 'UNAUTHORIZED' && state.token) {
    signOut();
    throw new Error('Session শেষ হয়েছে; আবার Login করুন।');
  }
  const extra = details?.length ? ` (${details.join(', ')})` : '';
  throw new Error(MESSAGES[code] ?? `${message}${extra}`);
}

const taka = (n) => `${n.toLocaleString('en-IN')} টাকা`;

async function loadPackages() {
  const packages = await api('/api/packages');
  $('#packages').replaceChildren(...packages.map((p) => {
    const item = document.createElement('li');
    item.textContent = `${p.name}: ${taka(p.priceBdt)}, আসন ${p.seats}`;
    return item;
  }));
  const select = $('#book select');
  const chosen = select.value;
  select.replaceChildren(...packages.map((p) => new Option(
    `${p.name} (${taka(p.priceBdt)})`, p.id, false, p.id === chosen)));
}

async function loadBookings() {
  const bookings = await api('/api/bookings');
  $('#bookings').replaceChildren(...bookings.map((b) => {
    const item = document.createElement('li');
    item.textContent = `#${b.id} ${b.packageId}, ${b.travelers} জন, `
      + `${taka(b.totalBdt)}, ${b.status} `;
    item.classList.toggle('cancelled', b.status === 'CANCELLED');
    if (b.status === 'CONFIRMED') {
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.textContent = 'বাতিল';
      cancel.dataset.id = b.id;
      item.append(cancel);
    }
    return item;
  }));
}

function render() {
  $('#who').textContent = state.user
    ? `${state.user.name} হিসেবে Login` : 'অতিথি হিসেবে দেখছেন';
  $('#logout').hidden = !state.user;
  $('#account').hidden = Boolean(state.user);
  $('#booking').hidden = !state.user;
}

function signOut() {
  Object.assign(state, { token: null, user: null, pendingKey: null });
  render();
}

// প্রতিটি Form-এর জন্য একই কাঠামো: বার্তা মোছা, কাজ, Error দেখানো।
function onSubmit(selector, work) {
  $(selector).addEventListener('submit', async (event) => {
    event.preventDefault();
    say('');
    try {
      await work(new FormData(event.target), event.target);
    } catch (error) {
      say(error.message, true);
    }
  });
}

onSubmit('#register', async (form, element) => {
  await api('/api/register', { method: 'POST',
    body: Object.fromEntries(form) });
  element.reset();
  say('নিবন্ধন সম্পন্ন। এবার Login করুন।');
});

onSubmit('#login', async (form, element) => {
  const session = await api('/api/login', { method: 'POST',
    body: Object.fromEntries(form) });
  Object.assign(state, { token: session.token, user: session.user });
  element.reset();
  render();
  say(`স্বাগতম, ${session.user.name}।`); // আগে বার্তা: পরে এলে নতুন বার্তা মুছত
  await loadBookings();
});

// Double Submit: busy থাকলে দ্বিতীয়টি উপেক্ষিত। Network ব্যর্থ হয়ে আবার
// চেষ্টা করলে একই pendingKey যায়, তাই Server-ও দ্বিতীয় Booking করে না।
onSubmit('#book', async (form) => {
  if (state.busy) return;
  state.busy = true;
  $('#book-button').disabled = true;
  state.pendingKey ??= crypto.randomUUID();
  try {
    const booking = await api('/api/bookings', { method: 'POST', body: {
      packageId: form.get('packageId'),
      travelers: Number(form.get('travelers')),
      idempotencyKey: state.pendingKey } });
    state.pendingKey = null;
    say(`Booking #${booking.id} নিশ্চিত: ${taka(booking.totalBdt)}`);
    await Promise.all([loadBookings(), loadPackages()]);
  } finally {
    state.busy = false;
    $('#book-button').disabled = false;
  }
});

// Form-এর কিছু বদলালে নতুন অনুরোধ, তাই নতুন Key।
$('#book').addEventListener('input', () => { state.pendingKey = null; });

$('#bookings').addEventListener('click', async (event) => {
  const id = event.target.dataset?.id;
  if (!id) return;
  try {
    await api(`/api/bookings/${id}/cancel`, { method: 'PATCH' });
    say(`Booking #${id} বাতিল হয়েছে।`);
    await Promise.all([loadBookings(), loadPackages()]);
  } catch (error) {
    say(error.message, true);
  }
});

$('#logout').addEventListener('click', async () => {
  await api('/api/logout', { method: 'POST' }).catch(() => {});
  signOut();
  say('Logout হয়েছে।');
});

render();
loadPackages().catch((error) => say(error.message, true));
