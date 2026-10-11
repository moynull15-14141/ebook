import {catalog,calculateTotal,parseBookingInput,type Booking,type BookingError,type BookingStatus,type Package,type Result} from './domain.js';
export interface BookingRepository {findById(id:string):Booking|undefined;save(booking:Booking):void;list():readonly Booking[]}
export class InMemoryBookingRepository implements BookingRepository {
 private readonly data=new Map<string,Booking>();
 findById(id:string):Booking|undefined{return this.data.get(id)}
 save(booking:Booking):void{this.data.set(booking.id,booking)}
 list():readonly Booking[]{return [...this.data.values()]}
}
export class BookingService {
 constructor(private readonly repository:BookingRepository,private readonly packages:readonly Package[]=catalog){}
 create(raw:unknown):Result<Booking,BookingError>{
  const parsed=parseBookingInput(raw);if(!parsed.ok)return parsed;
  const input=parsed.value;
  if(this.repository.findById(input.id))return {ok:false,error:{code:'DUPLICATE_ID',message:'Booking ID already exists'}};
  const pkg=this.packages.find(p=>p.id===input.packageId);
  if(!pkg)return {ok:false,error:{code:'PACKAGE_NOT_FOUND',message:'Package not found'}};
  const booking:Booking={id:input.id,packageId:pkg.id,customerName:input.customerName,travelers:input.travelers,totalBDT:calculateTotal(pkg.priceBDT,input.travelers),currency:'BDT',status:'pending'};
  this.repository.save(booking);return {ok:true,value:booking};
 }
 changeStatus(id:string,next:BookingStatus):Result<Booking,BookingError>{
  const booking=this.repository.findById(id);
  if(!booking)return {ok:false,error:{code:'INVALID_INPUT',message:'Booking not found'}};
  const allowed:Record<BookingStatus,readonly BookingStatus[]>={pending:['confirmed','cancelled'],confirmed:['cancelled'],cancelled:[]};
  if(!allowed[booking.status].includes(next))return {ok:false,error:{code:'INVALID_TRANSITION',message:'Status transition not allowed'}};
  const updated:Booking={...booking,status:next};this.repository.save(updated);return {ok:true,value:updated};
 }
 list():readonly Booking[]{return this.repository.list()}
}
