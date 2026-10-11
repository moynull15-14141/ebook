export class LiveError extends Error { constructor(code) { super(code); this.code=code; } }
export function reconnectDelay(attempt, random=Math.random) {
  if (!Number.isInteger(attempt) || attempt<0) throw new LiveError('INVALID_ATTEMPT');
  const capped=Math.min(30000,500*2**Math.min(attempt,6));
  return Math.floor(capped*(0.75+random()*0.5));
}
export class TravelLive {
  #bookings=new Map(); #events=new Map(); #listeners=new Map(); #counter=0; #maxHistory;
  constructor({maxHistory=100}={}) { if (!Number.isInteger(maxHistory)||maxHistory<1) throw new LiveError('INVALID_HISTORY');this.#maxHistory=maxHistory; }
  createBooking({id,userId}) {
    if (typeof id!=='string'||!id.trim()||typeof userId!=='string'||!userId.trim()||this.#bookings.has(id)) throw new LiveError('INVALID_BOOKING');
    this.#bookings.set(id,{id,userId,status:'PENDING',sequence:0});this.#events.set(id,[]);
    return this.snapshot(userId,id);
  }
  #authorized(userId,id) {
    const booking=this.#bookings.get(id);
    if (!booking || booking.userId!==userId) throw new LiveError('FORBIDDEN');
    return booking;
  }
  snapshot(userId,id) { return {...this.#authorized(userId,id)}; }
  changeStatus({actorId,bookingId,status}) {
    const booking=this.#authorized(actorId,bookingId);
    if (!['CONFIRMED','CANCELLED'].includes(status)) throw new LiveError('INVALID_STATUS');
    if (booking.status==='CANCELLED'||booking.status===status) throw new LiveError('INVALID_TRANSITION');
    booking.status=status;booking.sequence+=1;
    const event=Object.freeze({eventId:`evt-${++this.#counter}`,type:'booking.status.changed',version:1,bookingId,sequence:booking.sequence,payload:Object.freeze({status})});
    const history=this.#events.get(bookingId);history.push(event);if(history.length>this.#maxHistory)history.shift();
    for (const entry of this.#listeners.get(bookingId)||[]) {
      try {this.#authorized(entry.userId,bookingId);entry.listener(event)} catch { /* listener failure must not roll back committed state */ }
    }
    return event;
  }
  subscribe(userId,bookingId,listener,{after=0}={}) {
    this.#authorized(userId,bookingId);
    if (typeof listener!=='function'||!Number.isSafeInteger(after)||after<0) throw new LiveError('INVALID_SUBSCRIPTION');
    const history=this.#events.get(bookingId);
    const current=this.#bookings.get(bookingId).sequence;
    const oldest=history[0]?.sequence??(current+1);
    if (after<oldest-1) throw new LiveError('REPLAY_GAP');
    const entry={userId,listener};
    if (!this.#listeners.has(bookingId)) this.#listeners.set(bookingId,new Set());
    const listeners=this.#listeners.get(bookingId);listeners.add(entry);
    for (const event of history) if(event.sequence>after) {
      try {listener(event)} catch { /* delivery callback errors are isolated */ }
    }
    return ()=>{listeners.delete(entry);if(!listeners.size)this.#listeners.delete(bookingId)};
  }
}
export class EventConsumer {
  #seen=new Set(); #last=new Map();
  apply(event) {
    if (!event||typeof event.eventId!=='string'||typeof event.bookingId!=='string'||!Number.isSafeInteger(event.sequence)||event.sequence<1) throw new LiveError('INVALID_EVENT');
    if (this.#seen.has(event.eventId)) return false;
    const last=this.#last.get(event.bookingId)||0;
    if (event.sequence!==last+1) throw new LiveError('SEQUENCE_GAP');
    this.#seen.add(event.eventId);this.#last.set(event.bookingId,event.sequence);return true;
  }
  lastSequence(bookingId) {return this.#last.get(bookingId)||0;}
}
