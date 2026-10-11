import { BookingManager, FlightBooking, HotelBooking } from './booking.mjs';
const manager = new BookingManager();
const form = document.querySelector('#booking-form');
const list = document.querySelector('#booking-list');
const message = document.querySelector('#message');
const revenue = document.querySelector('#revenue');
const extraLabel = document.querySelector('#extra-label');
const extraInput = document.querySelector('#extra');
const typeSelect = document.querySelector('#type');

function syncExtraLabel() {
  extraLabel.textContent = typeSelect.value === 'flight' ? 'Baggage fee (BDT)' : 'Number of nights';
  extraInput.value = typeSelect.value === 'flight' ? '0' : '1';
}
function render() {
  list.replaceChildren();
  for (const booking of manager.list()) {
    const li = document.createElement('li');
    const description = document.createElement('span');
    description.textContent = `${booking.id} · ${booking.customer} · ${booking.type} · BDT ${booking.total.toFixed(2)} · ${booking.status}`;
    li.append(description);
    if (booking.status === 'confirmed') {
      const cancel = document.createElement('button');
      cancel.type = 'button'; cancel.textContent = 'Cancel';
      cancel.addEventListener('click', () => {
        try { manager.cancel(booking.id); message.textContent = 'Booking cancelled'; render(); }
        catch (error) { message.textContent = error.message; }
      });
      li.append(cancel);
    }
    list.append(li);
  }
  revenue.textContent = `Confirmed revenue: BDT ${manager.confirmedRevenue.toFixed(2)}`;
}
typeSelect.addEventListener('change', syncExtraLabel);
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const common = { id: String(data.get('id') ?? ''), customer: String(data.get('customer') ?? ''), price: Number(data.get('price')) };
  const extra = Number(data.get('extra'));
  try {
    const booking = typeSelect.value === 'flight'
      ? new FlightBooking({ ...common, baggageFee: extra })
      : new HotelBooking({ ...common, nights: extra });
    manager.add(booking);
    message.textContent = 'Booking created';
    form.reset(); syncExtraLabel(); render();
  } catch (error) { message.textContent = error.message; }
});
syncExtraLabel(); render();
