import test from 'node:test';import assert from 'node:assert/strict';import {createApp} from './server.mjs';
test('HTTP register, login, book and read flow',async()=>{
 const server=createApp();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{const base=`http://127.0.0.1:${server.address().port}`;
 const post=(path,body,headers={})=>fetch(base+path,{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});
 const email=`test-${Date.now()}@example.com`;
 const registration=await post('/api/register',{email,password:'a strong password 123'});assert.equal(registration.status,201);
 const login=await post('/api/login',{email,password:'a strong password 123'});assert.equal(login.status,200);
 const cookie=login.headers.get('set-cookie').split(';')[0];
 const unauth=await fetch(base+'/api/bookings');assert.equal(unauth.status,401);
 const booking=await post('/api/bookings',{packageId:'cox',travelers:2},{cookie});assert.equal(booking.status,201);assert.equal((await booking.json()).totalBDT,24000);
 const listing=await fetch(base+'/api/bookings',{headers:{cookie}});assert.equal((await listing.json()).length,1);
 const health=await fetch(base+'/health');assert.equal(health.status,200);
 }finally{await new Promise(resolve=>server.close(resolve))}
});
