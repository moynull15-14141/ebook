import {createBookingService,createMemoryRepository} from './booking.mjs';
const $=id=>document.getElementById(id);
const repository=createMemoryRepository();
const notifier={async send(type,booking){console.info('Demo event',type,booking.id)}};
const service=createBookingService({repository,notifier,idFactory:()=>`BK-${crypto.randomUUID()}`});
async function render(){const ul=$('bookings');ul.replaceChildren();for(const b of await service.list()){
 const li=document.createElement('li');li.append(document.createTextNode(`${b.customer} • ${b.packageId} • BDT ${b.total} • ${b.status}`));
 if(b.status==='pending'){const btn=document.createElement('button');btn.textContent='Confirm';btn.addEventListener('click',async()=>{try{await service.confirm(b.id);await render()}catch(e){$('message').textContent=e.message}});li.append(btn)}ul.append(li)
}}
$('form').addEventListener('submit',async e=>{e.preventDefault();try{await service.place({customer:$('customer').value,packageId:$('package').value,guests:$('guests').value});$('message').textContent='Demo booking saved';await render()}catch(err){$('message').textContent=err.message}});
render();
