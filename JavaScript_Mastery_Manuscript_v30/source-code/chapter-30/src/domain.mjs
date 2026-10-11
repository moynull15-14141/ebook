import { randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

export class AppError extends Error {
  constructor(status, code, message) { super(message); this.status=status; this.code=code; }
}
const fail=(status,code,message)=>{throw new AppError(status,code,message)};
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validEmail=v=>typeof v==='string'&&v.length<=254&&emailPattern.test(v);
const validName=v=>typeof v==='string'&&v.trim().length>=2&&v.trim().length<=80;
const validPassword=v=>typeof v==='string'&&v.length>=12&&v.length<=128;
const safeEqual=(a,b)=>{
 const aa=Buffer.from(a,'hex'),bb=Buffer.from(b,'hex');
 return aa.length===bb.length&&timingSafeEqual(aa,bb);
};
const hashPassword=(password,salt=randomUUID().replaceAll('-',''))=>({salt,hash:scryptSync(password,salt,64).toString('hex')});

export class TravelMaster {
 constructor({packages=[{id:'BT-4D',name:'Bhutan Escape',price:65800,seats:4},{id:'SG-3D',name:'Singapore City',price:45000,seats:6}], clock=()=>Date.now()}={}) {
  this.clock=clock;this.packages=new Map(packages.map(x=>[x.id,{...x}]));
  this.users=new Map();this.usersByEmail=new Map();this.sessions=new Map();this.bookings=new Map();this.idempotency=new Map();this.audit=[];
 }
 listPackages(){return [...this.packages.values()].map(x=>({...x}));}
 register({name,email,password}={}){
  if(!validName(name)||!validEmail(email)||!validPassword(password))fail(400,'VALIDATION','Provide name, valid email and password (12–128 chars)');
  email=email.trim().toLowerCase();if(this.usersByEmail.has(email))fail(409,'EMAIL_EXISTS','Email already registered');
  const user={id:randomUUID(),name:name.trim(),email,...hashPassword(password)};
  this.users.set(user.id,user);this.usersByEmail.set(email,user.id);this.log('user.registered',user.id);
  return {id:user.id,name:user.name,email:user.email};
 }
 login({email,password}={}){
  if(typeof email!=='string'||typeof password!=='string')fail(401,'UNAUTHORIZED','Invalid credentials');
  const user=this.users.get(this.usersByEmail.get(email.trim().toLowerCase()));
  if(!user||!safeEqual(scryptSync(password,user.salt,64).toString('hex'),user.hash))fail(401,'UNAUTHORIZED','Invalid credentials');
  const token=randomUUID()+randomUUID();this.sessions.set(token,{userId:user.id,expiresAt:this.clock()+3600000});this.log('user.login',user.id);
  return {token,user:{id:user.id,name:user.name,email:user.email}};
 }
 authenticate(token){const s=this.sessions.get(token);if(!s||s.expiresAt<=this.clock())fail(401,'UNAUTHORIZED','Login required');return s.userId;}
 logout(token){this.sessions.delete(token);}
 log(event,actor,details={}){this.audit.push({event,actor,at:new Date(this.clock()).toISOString(),...details});}
 createBooking(userId,{packageId,travelers,idempotencyKey}={}){
  if(typeof idempotencyKey!=='string'||!/^[A-Za-z0-9_-]{8,80}$/.test(idempotencyKey))fail(400,'IDEMPOTENCY_KEY','Valid idempotency key required');
  if(typeof packageId!=='string'||!Number.isInteger(travelers)||travelers<1||travelers>10)fail(400,'VALIDATION','Valid package and 1–10 travelers required');
  const key=userId+':'+idempotencyKey;
  if(this.idempotency.has(key)){
   const previous=this.idempotency.get(key);
   if(previous.packageId!==packageId||previous.travelers!==travelers)fail(409,'KEY_CONFLICT','Key already used with different input');
   return {...this.bookings.get(previous.bookingId)};
  }
  const pkg=this.packages.get(packageId);if(!pkg)fail(404,'PACKAGE_NOT_FOUND','Package not found');
  if(pkg.seats<travelers)fail(409,'SOLD_OUT','Insufficient seats');
  pkg.seats-=travelers;
  const booking={id:randomUUID(),userId,packageId,travelers,totalBDT:pkg.price*travelers,status:'confirmed',createdAt:new Date(this.clock()).toISOString()};
  this.bookings.set(booking.id,booking);this.idempotency.set(key,{packageId,travelers,bookingId:booking.id});
  this.log('booking.created',userId,{bookingId:booking.id});return {...booking};
 }
 myBookings(userId){return [...this.bookings.values()].filter(b=>b.userId===userId).map(b=>({...b}));}
 cancelBooking(userId,id){const booking=this.bookings.get(id);if(!booking||booking.userId!==userId)fail(404,'NOT_FOUND','Booking not found');
  if(booking.status==='cancelled')return {...booking};
  booking.status='cancelled';this.packages.get(booking.packageId).seats+=booking.travelers;
  this.log('booking.cancelled',userId,{bookingId:id});return {...booking};
 }
 dashboard(){return {users:this.users.size,bookings:this.bookings.size,confirmed:[...this.bookings.values()].filter(x=>x.status==='confirmed').length};}
}
