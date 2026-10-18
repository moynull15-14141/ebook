import { BookingView } from '/client-state.mjs';
import { reconnectDelay } from '/backoff.mjs';

const [token, ...bookingIds] = location.hash.slice(1).split(/[:,]/);
const view = new BookingView();
const $ = (selector) => document.querySelector(selector);
let attempt = 0;

function render() {
  $('#bookings').replaceChildren(...bookingIds.map((id) => {
    const item = document.createElement('li');
    const booking = view.get(id);
    item.dataset.status = booking?.status ?? 'UNKNOWN';
    item.textContent = `${id}: ${booking?.title ?? ''} — `
      + `${booking?.status ?? 'অপেক্ষমাণ'} (#${booking?.sequence ?? 0})`;
    return item;
  }));
}

function connect() {
  const socket = new WebSocket(`ws://${location.host}/live`);
  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'auth', token }));
  });
  socket.addEventListener('message', ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.type === 'auth.ok') {
      attempt = 0;
      $('#connection').textContent = 'সংযুক্ত';
      // পুনঃসংযোগে শেষ দেখা Sequence পাঠিয়ে শুধু বাদ পড়া Event চাওয়া।
      for (const bookingId of bookingIds) {
        socket.send(JSON.stringify({ type: 'subscribe', bookingId,
          requestId: bookingId, afterSequence: view.lastSequence(bookingId) }));
      }
    }
    if (msg.type === 'snapshot') view.loadSnapshot(msg.snapshot);
    if (msg.type === 'event' && view.apply(msg.event) === 'gap') {
      socket.close(); // ফাঁক: নতুন করে সংযোগ, Server Replay বা Snapshot দেবে
    }
    if (msg.type === 'ack' && !msg.ok) console.error('subscribe', msg.code);
    render();
  });
  socket.addEventListener('close', () => {
    const delay = reconnectDelay(attempt++);
    $('#connection').textContent = `বিচ্ছিন্ন; ${delay} ms পরে আবার চেষ্টা`;
    setTimeout(connect, delay);
  });
}

render();
connect();
