import {ValidationError,ConflictError,createBooking,addBooking,cancelBooking,summarizeBookings,safeReadBookings} from './booking-core.mjs';
const $=id=>document.getElementById(id);
const KEY='bookingguard.v1';
let bookings=safeReadBookings(localStorage,KEY);
function message(text,kind='info'){$('message').textContent=text;$('message').dataset.kind=kind;}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(bookings));}catch{message('Storage unavailable: data may be lost after reload','error');}}
function render(){const list=$('bookings');list.replaceChildren();const s=summarizeBookings(bookings);$('summary').textContent=`Total: ${s.totalBookings} | Confirmed: ${s.confirmed} | Revenue: ${s.revenue.toFixed(2)}`;
for(const item of bookings){const li=document.createElement('li');const label=document.createElement('span');label.textContent=`${item.id} — ${item.customer} — ${item.seats} seats — ${item.total.toFixed(2)} — ${item.status}`;li.append(label);if(item.status==='confirmed'){const btn=document.createElement('button');btn.textContent='Cancel';btn.type='button';btn.addEventListener('click',()=>{bookings=cancelBooking(bookings,item.id);persist();render();message('Booking cancelled');});li.append(btn);}list.append(li);}}
$('bookingForm').addEventListener('submit',event=>{event.preventDefault();try{const f=new FormData(event.currentTarget);const input=Object.fromEntries(f.entries());const id=`BK-${crypto.randomUUID()}`;bookings=addBooking(bookings,createBooking(input,id));persist();render();event.currentTarget.reset();message('Booking confirmed','success');}catch(error){if(error instanceof ValidationError){message(`${error.field}: ${error.message}`,'error');}else if(error instanceof ConflictError){message(error.message,'error');}else{console.error('Unexpected booking failure',error);message('Unexpected error: আবার চেষ্টা করুন','error');}}});
window.addEventListener('error',event=>console.error('Unhandled error',event.error));
window.addEventListener('unhandledrejection',event=>console.error('Unhandled rejection',event.reason));
render();
