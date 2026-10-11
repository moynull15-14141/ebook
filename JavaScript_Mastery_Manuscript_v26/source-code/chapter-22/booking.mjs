export class BookingError extends Error {
  constructor(code,message){super(message);this.name='BookingError';this.code=code}
}
export const PACKAGES=Object.freeze({beach:4500,hills:7200,city:3900});
export function validateBooking(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new BookingError('INPUT','Booking object required');
  const customer=typeof input.customer==='string'?input.customer.trim():'';
  if(customer.length<2||customer.length>60)throw new BookingError('CUSTOMER','Name must be 2–60 characters');
  if(!Object.hasOwn(PACKAGES,input.packageId))throw new BookingError('PACKAGE','Choose a valid package');
  const guests=Number(input.guests);
  if(!Number.isSafeInteger(guests)||guests<1||guests>10)throw new BookingError('GUESTS','Guests must be 1–10');
  return {customer,packageId:input.packageId,guests,total:PACKAGES[input.packageId]*guests};
}
export function calculateTotal(packageId,guests){return validateBooking({customer:'Test User',packageId,guests}).total}
export function transition(booking,status){
  const allowed={pending:['confirmed','cancelled'],confirmed:['cancelled'],cancelled:[]};
  if(!allowed[booking?.status]?.includes(status))throw new BookingError('STATUS','Invalid booking transition');
  return {...booking,status};
}
export function createBookingService({repository,notifier,idFactory}){
  if(!repository||!notifier||!idFactory)throw new TypeError('Dependencies required');
  return {
    async place(input){const clean=validateBooking(input);const booking={...clean,id:idFactory(),status:'pending'};await repository.save(booking);await notifier.send('created',booking);return booking},
    async confirm(id){const existing=await repository.find(id);if(!existing)throw new BookingError('NOT_FOUND','Booking not found');const updated=transition(existing,'confirmed');await repository.save(updated);await notifier.send('confirmed',updated);return updated},
    async list(){return repository.all()}
  };
}
export function createMemoryRepository(){
  const data=new Map();return {
    async save(b){data.set(b.id,structuredClone(b));return structuredClone(b)},
    async find(id){return data.has(id)?structuredClone(data.get(id)):null},
    async all(){return [...data.values()].map(x=>structuredClone(x))}
  };
}
