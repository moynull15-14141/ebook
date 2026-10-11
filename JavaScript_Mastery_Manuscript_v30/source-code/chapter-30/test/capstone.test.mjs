import test from 'node:test';import assert from 'node:assert/strict';
import { TravelMaster,AppError } from '../src/domain.mjs';
import { createAppServer } from '../src/server.mjs';
const input={name:'Test User',email:'test@example.com',password:'secure-passphrase-123'};
const make=()=>{const s=new TravelMaster();const user=s.register(input);return {s,user};};
const code=(fn,c)=>assert.throws(fn,e=>e instanceof AppError&&e.code===c);
test('registration validates password',()=>code(()=>new TravelMaster().register({...input,password:'short'}),'VALIDATION'));
test('duplicate email normalized',()=>{const {s}=make();code(()=>s.register({...input,email:'TEST@EXAMPLE.COM'}),'EMAIL_EXISTS')});
test('login rejects wrong password',()=>{const {s}=make();code(()=>s.login({email:input.email,password:'wrong'}),'UNAUTHORIZED')});
test('session expiration enforced',()=>{let now=0;const s=new TravelMaster({clock:()=>now});s.register(input);const {token}=s.login({email:input.email,password:input.password});now=3600000;code(()=>s.authenticate(token),'UNAUTHORIZED')});
test('booking uses server-side price and decrements inventory',()=>{const {s,user}=make();const b=s.createBooking(user.id,{packageId:'BT-4D',travelers:2,idempotencyKey:'key-00001',price:1});assert.equal(b.totalBDT,131600);assert.equal(s.listPackages()[0].seats,2)});
test('idempotent retry does not double-book',()=>{const {s,user}=make();const x={packageId:'BT-4D',travelers:2,idempotencyKey:'key-00001'};const a=s.createBooking(user.id,x),b=s.createBooking(user.id,x);assert.equal(a.id,b.id);assert.equal(s.listPackages()[0].seats,2)});
test('idempotency key cannot be reused for different request',()=>{const {s,user}=make();s.createBooking(user.id,{packageId:'BT-4D',travelers:1,idempotencyKey:'key-00001'});code(()=>s.createBooking(user.id,{packageId:'BT-4D',travelers:2,idempotencyKey:'key-00001'}),'KEY_CONFLICT')});
test('sold out bookings rejected without negative seats',()=>{const {s,user}=make();code(()=>s.createBooking(user.id,{packageId:'BT-4D',travelers:5,idempotencyKey:'key-00001'}),'SOLD_OUT');assert.equal(s.listPackages()[0].seats,4)});
test('booking ownership enforced',()=>{const {s,user}=make();const other=s.register({name:'Other User',email:'other@example.com',password:'another-password-123'});const b=s.createBooking(user.id,{packageId:'BT-4D',travelers:1,idempotencyKey:'key-00001'});code(()=>s.cancelBooking(other.id,b.id),'NOT_FOUND');assert.equal(s.myBookings(other.id).length,0)});
test('cancel restores inventory once',()=>{const {s,user}=make();const b=s.createBooking(user.id,{packageId:'BT-4D',travelers:2,idempotencyKey:'key-00001'});s.cancelBooking(user.id,b.id);s.cancelBooking(user.id,b.id);assert.equal(s.listPackages()[0].seats,4)});
test('logout revokes token',()=>{const {s}=make();const {token}=s.login({email:input.email,password:input.password});s.logout(token);code(()=>s.authenticate(token),'UNAUTHORIZED')});
test('HTTP register-login-booking-history flow',async()=>{
 const server=createAppServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{const root=`http://127.0.0.1:${server.address().port}`;
 const post=(path,data,token)=>fetch(root+path,{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify(data)});
 const reg=await post('/api/register',input);assert.equal(reg.status,201);
 const login=await post('/api/login',{email:input.email,password:input.password});const {data:{token}}=await login.json();
 const booked=await post('/api/bookings',{packageId:'BT-4D',travelers:2,idempotencyKey:'http-key-001'},token);assert.equal(booked.status,201);
 const history=await fetch(root+'/api/bookings',{headers:{authorization:`Bearer ${token}`}});assert.equal((await history.json()).data.length,1);
 const noAuth=await fetch(root+'/api/bookings');assert.equal(noAuth.status,401);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
test('HTTP malformed JSON rejected',async()=>{const server=createAppServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));try{const response=await fetch(`http://127.0.0.1:${server.address().port}/api/register`,{method:'POST',headers:{'content-type':'application/json'},body:'{' });assert.equal(response.status,400)}finally{await new Promise(r=>server.close(r));}});
