import {randomUUID,scryptSync,timingSafeEqual,randomBytes} from 'node:crypto';
import {findPackage} from './catalog.mjs';
export class DomainError extends Error {constructor(status,code,message){super(message);this.status=status;this.code=code;}}
export function validateRegistration(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new DomainError(400,'INVALID_BODY','JSON object required');
 const {email,password}=raw;
 if(typeof email!=='string'||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new DomainError(400,'INVALID_EMAIL','Valid email required');
 if(typeof password!=='string'||password.length<12||password.length>128)throw new DomainError(400,'INVALID_PASSWORD','Password must contain 12–128 characters');
 return {email:email.toLowerCase().trim(),password};
}
export function hashPassword(password){const salt=randomBytes(16).toString('hex');const hash=scryptSync(password,salt,64).toString('hex');return `${salt}:${hash}`;}
export function verifyPassword(password,stored){try{const [salt,hash]=stored.split(':');if(!salt||!hash)return false;const expected=Buffer.from(hash,'hex');const actual=scryptSync(password,salt,expected.length);return expected.length===actual.length&&timingSafeEqual(expected,actual)}catch{return false}}
export function validateBooking(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new DomainError(400,'INVALID_BODY','JSON object required');
 const {packageId,travelers}=raw;
 if(typeof packageId!=='string')throw new DomainError(400,'INVALID_PACKAGE','Package ID required');
 if(!Number.isSafeInteger(travelers)||travelers<1||travelers>20)throw new DomainError(400,'INVALID_TRAVELERS','Travelers must be 1–20');
 const pkg=findPackage(packageId);if(!pkg)throw new DomainError(404,'PACKAGE_NOT_FOUND','Package not found');
 return {packageId:pkg.id,travelers,totalBDT:pkg.price*travelers};
}
export function createService({repository,clock=()=>new Date().toISOString()}){
 return {
  register(raw){const input=validateRegistration(raw);if(repository.findUserByEmail(input.email))throw new DomainError(409,'EMAIL_EXISTS','Email already registered');const user={id:randomUUID(),email:input.email,passwordHash:hashPassword(input.password)};repository.saveUser(user);return {id:user.id,email:user.email}},
  authenticate(raw){if(!raw||typeof raw!=='object')throw new DomainError(400,'INVALID_BODY','JSON object required');const email=typeof raw.email==='string'?raw.email.toLowerCase().trim():'';const password=typeof raw.password==='string'?raw.password:'';const user=repository.findUserByEmail(email);if(!user||!verifyPassword(password,user.passwordHash))throw new DomainError(401,'INVALID_CREDENTIALS','Invalid credentials');return {id:user.id,email:user.email}},
  book(userId,raw){const values=validateBooking(raw);const booking={id:randomUUID(),userId,...values,status:'pending',createdAt:clock()};repository.saveBooking(booking);return booking},
  list(userId){return repository.listBookings(userId)},
  cancel(userId,id){const booking=repository.findBooking(id);if(!booking||booking.userId!==userId)throw new DomainError(404,'NOT_FOUND','Booking not found');if(booking.status==='cancelled')throw new DomainError(409,'ALREADY_CANCELLED','Already cancelled');const updated={...booking,status:'cancelled'};repository.saveBooking(updated);return updated}
 }
}
