import {TravelDataStore} from './core.mjs';
const store=new TravelDataStore();store.addPackage({id:'cox',title:'Cox’s Bazar',priceMinor:125000,availableSeats:5});
const booking=store.reserve({userId:'demo-user',packageId:'cox',seats:2,idempotencyKey:'request-001'});
console.log({booking,remaining:store.package('cox').availableSeats,report:store.report()});
