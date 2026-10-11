// Educational client-side validation; server MUST revalidate and authorize.
export const PACKAGES=Object.freeze([
  Object.freeze({id:'city',name:'City Escape',price:8500}),
  Object.freeze({id:'nature',name:'Nature Retreat',price:12500}),
  Object.freeze({id:'heritage',name:'Heritage Tour',price:15000})
]);
export class ValidationError extends Error{constructor(message,field){super(message);this.name='ValidationError';this.field=field}}
export function normalizeText(value){return typeof value==='string'?value.normalize('NFC').trim():''}
export function validateBooking(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new ValidationError('Invalid booking input','form');
  const customer=normalizeText(input.customer);
  if(customer.length<2||customer.length>80||/[<>\u0000-\u001f]/u.test(customer))throw new ValidationError('Name must be 2–80 characters without markup/control characters','customer');
  const email=normalizeText(input.email).toLowerCase();
  if(email.length>254||!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)))throw new ValidationError('Enter a valid email address','email');
  const pkg=PACKAGES.find(x=>x.id===input.packageId);
  if(!pkg)throw new ValidationError('Select a listed package','packageId');
  const travelers=Number(input.travelers);
  if(!Number.isSafeInteger(travelers)||travelers<1||travelers>8)throw new ValidationError('Travelers must be an integer from 1 to 8','travelers');
  if(input.consent!==true)throw new ValidationError('Consent is required','consent');
  return {customer,email,packageId:pkg.id,packageName:pkg.name,travelers,total:pkg.price*travelers};
}
export function createBooking(input,id){
  const clean=validateBooking(input);
  if(typeof id!=='string'||!/^BK-[a-f0-9]{16,64}$/u.test(id))throw new ValidationError('Invalid generated ID','id');
  return Object.freeze({...clean,id,status:'pending',createdAt:new Date().toISOString()});
}
export function summarizeBookings(bookings){
  if(!Array.isArray(bookings))throw new TypeError('Bookings must be an array');
  return {count:bookings.length,totalRequested:bookings.reduce((sum,b)=>sum+b.total,0),confirmedRevenue:bookings.filter(b=>b.status==='confirmed').reduce((sum,b)=>sum+b.total,0)};
}
export function safeReturnPath(path){
  if(typeof path!=='string'||!path.startsWith('/')||path.startsWith('//')||path.includes('\\')||/[\u0000-\u001f]/u.test(path))return '/';
  return path;
}
