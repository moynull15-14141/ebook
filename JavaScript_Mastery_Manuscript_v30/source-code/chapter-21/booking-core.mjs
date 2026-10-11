// Domain logic: no DOM or localStorage dependency.
export const CATALOG=Object.freeze([
  Object.freeze({id:'cox',title:'Cox’s Bazar Weekend',unitPrice:6500}),
  Object.freeze({id:'sylhet',title:'Sylhet Nature Escape',unitPrice:8900}),
  Object.freeze({id:'sundarbans',title:'Sundarbans Explorer',unitPrice:12500})
]);
export class DomainError extends Error {constructor(code,message){super(message);this.name='DomainError';this.code=code}}
export function validateRequest(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new DomainError('INVALID_INPUT','Booking request is required');
  const customer=typeof input.customer==='string'?input.customer.trim():'';
  if(customer.length<2||customer.length>80)throw new DomainError('INVALID_CUSTOMER','Customer name must contain 2–80 characters');
  const product=CATALOG.find(x=>x.id===input.packageId);
  if(!product)throw new DomainError('INVALID_PACKAGE','Select a listed package');
  const travelers=Number(input.travelers);
  if(!Number.isSafeInteger(travelers)||travelers<1||travelers>8)throw new DomainError('INVALID_TRAVELERS','Travelers must be 1–8');
  return {customer,packageId:product.id,packageTitle:product.title,travelers,total:product.unitPrice*travelers};
}
export function createBooking(input,id){
  const data=validateRequest(input);
  if(typeof id!=='string'||!/^BK-[a-f0-9]{16,64}$/.test(id))throw new DomainError('INVALID_ID','Invalid booking ID');
  return {...data,id,status:'pending',createdAt:new Date().toISOString()};
}
export function transitionBooking(booking,next){
  if(!booking||typeof booking!=='object')throw new DomainError('INVALID_BOOKING','Booking required');
  const allowed={pending:['confirmed','cancelled'],confirmed:['cancelled'],cancelled:[]};
  if(!allowed[booking.status]?.includes(next))throw new DomainError('INVALID_TRANSITION',`Cannot change ${booking.status} to ${next}`);
  return {...booking,status:next};
}
export function summarize(bookings){
  return {count:bookings.length,pending:bookings.filter(x=>x.status==='pending').length,confirmed:bookings.filter(x=>x.status==='confirmed').length,confirmedRevenue:bookings.filter(x=>x.status==='confirmed').reduce((sum,x)=>sum+x.total,0)};
}
