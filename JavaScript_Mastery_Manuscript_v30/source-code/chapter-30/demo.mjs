import { TravelMaster } from './src/domain.mjs';
const app=new TravelMaster();
const user=app.register({name:'Demo Traveler',email:'demo@example.com',password:'example-password-123'});
const {token}=app.login({email:'demo@example.com',password:'example-password-123'});
const booking=app.createBooking(app.authenticate(token),{packageId:'BT-4D',travelers:2,idempotencyKey:'demo-key-001'});
console.log(JSON.stringify({user,booking,packages:app.listPackages(),dashboard:app.dashboard()},null,2));
