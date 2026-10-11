import {CATALOG,summarize,DomainError} from './booking-core.mjs';
import {createBrowserRepository} from './repository.mjs';
import {createEventBus} from './events.mjs';
import {createBookingService} from './service.mjs';
const $=id=>document.getElementById(id);
const repo=createBrowserRepository(localStorage);const events=createEventBus();
const service=createBookingService({repository:repo,events,idFactory:()=>`BK-${Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(16).padStart(2,'0')).join('')}`});
for(const item of CATALOG){const option=document.createElement('option');option.value=item.id;option.textContent=`${item.title} — BDT ${item.unitPrice.toLocaleString()}`;$('package').append(option)}
function show(message,isError=false){$('message').textContent=message;$('message').className=isError?'error':'success'}
async function render(){
  const bookings=await service.list();const stats=summarize(bookings);
  $('summary').textContent=`Total: ${stats.count} | Pending: ${stats.pending} | Confirmed: ${stats.confirmed} | Confirmed revenue: BDT ${stats.confirmedRevenue.toLocaleString()}`;
  const tbody=$('rows');tbody.replaceChildren();
  for(const b of bookings.slice().reverse()){
    const tr=document.createElement('tr');
    for(const value of [b.customer,b.packageTitle,String(b.travelers),`BDT ${b.total.toLocaleString()}`,b.status]){const td=document.createElement('td');td.textContent=value;tr.append(td)}
    const actions=document.createElement('td');
    for(const [label,next] of [['Confirm','confirmed'],['Cancel','cancelled']]){
      if(b.status==='cancelled'||(b.status==='confirmed'&&next==='confirmed'))continue;
      const button=document.createElement('button');button.type='button';button.textContent=label;
      button.addEventListener('click',async()=>{try{await service.changeStatus(b.id,next);show(`Booking ${next}`)}catch(error){show(error.message,true)}});actions.append(button)
    }
    tr.append(actions);tbody.append(tr)
  }
}
events.on('booking:created',()=>{void render()});events.on('booking:updated',()=>{void render()});
$('form').addEventListener('submit',async event=>{
  event.preventDefault();
  try{const booking=await service.place({customer:$('customer').value,packageId:$('package').value,travelers:$('travelers').value});show(`Created ${booking.id}`);event.target.reset()}
  catch(error){show(error instanceof DomainError?error.message:'Could not save booking',true)}
});
render().catch(()=>show('Could not load bookings',true));
