import {TravelLive,EventConsumer} from './live-core.mjs';
const live=new TravelLive();const consumer=new EventConsumer();
live.createBooking({id:'BK-101',userId:'user-1'});
const unsubscribe=live.subscribe('user-1','BK-101',event=>{console.log('received:',event);console.log('new:',consumer.apply(event));});
live.changeStatus({actorId:'user-1',bookingId:'BK-101',status:'CONFIRMED'});
live.changeStatus({actorId:'user-1',bookingId:'BK-101',status:'CANCELLED'});
console.log('snapshot:',live.snapshot('user-1','BK-101'));unsubscribe();
