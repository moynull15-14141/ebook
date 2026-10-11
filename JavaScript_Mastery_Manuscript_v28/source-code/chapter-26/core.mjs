export class BookingError extends Error { constructor(code) { super(code); this.code=code; } }
export class TravelDataStore {
  #packages=new Map(); #bookings=new Map(); #keys=new Map(); #seq=0;
  addPackage({id,title,priceMinor,availableSeats}) {
    if (!id || !title || !Number.isSafeInteger(priceMinor) || priceMinor<0 || !Number.isSafeInteger(availableSeats) || availableSeats<0 || this.#packages.has(id)) throw new BookingError('INVALID_PACKAGE');
    this.#packages.set(id,{id,title,priceMinor,availableSeats});
  }
  reserve({userId,packageId,seats,idempotencyKey}) {
    if (!userId || !idempotencyKey || !Number.isSafeInteger(seats) || seats<=0) throw new BookingError('INVALID_BOOKING');
    const existing=this.#keys.get(idempotencyKey);
    if (existing) { if (existing.userId!==userId || existing.packageId!==packageId || existing.seats!==seats) throw new BookingError('IDEMPOTENCY_CONFLICT'); return {...existing}; }
    const pkg=this.#packages.get(packageId); if (!pkg) throw new BookingError('NOT_FOUND');
    if (pkg.availableSeats<seats) throw new BookingError('SOLD_OUT');
    const totalMinor=pkg.priceMinor*seats; if (!Number.isSafeInteger(totalMinor)) throw new BookingError('TOTAL_OVERFLOW');
    pkg.availableSeats-=seats;
    const booking={id:`b-${++this.#seq}`,userId,packageId,seats,totalMinor,status:'CONFIRMED',idempotencyKey,seq:this.#seq};
    this.#bookings.set(booking.id,booking); this.#keys.set(idempotencyKey,booking); return {...booking};
  }
  cancel({userId,bookingId}) {
    const booking=this.#bookings.get(bookingId); if (!booking || booking.userId!==userId) throw new BookingError('NOT_FOUND');
    if (booking.status==='CANCELLED') return {...booking};
    booking.status='CANCELLED'; this.#packages.get(booking.packageId).availableSeats+=booking.seats; return {...booking};
  }
  list({userId,after=0,limit=10}) {
    if (!userId || !Number.isSafeInteger(after) || after<0 || !Number.isSafeInteger(limit) || limit<1 || limit>100) throw new BookingError('INVALID_PAGE');
    return [...this.#bookings.values()].filter(b=>b.userId===userId && b.seq>after).sort((a,b)=>a.seq-b.seq).slice(0,limit).map(b=>({...b}));
  }
  report() { const all=[...this.#bookings.values()]; return {confirmed:all.filter(b=>b.status==='CONFIRMED').length,revenueMinor:all.filter(b=>b.status==='CONFIRMED').reduce((s,b)=>s+b.totalMinor,0)}; }
  package(id) { const p=this.#packages.get(id); return p?{...p}:null; }
}
