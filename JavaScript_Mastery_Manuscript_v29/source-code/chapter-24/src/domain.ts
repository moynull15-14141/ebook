export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type Currency = 'BDT';
export interface Package { readonly id: string; readonly title: string; readonly priceBDT: number; }
export interface Booking { readonly id: string; readonly packageId: string; readonly customerName: string; readonly travelers: number; readonly totalBDT: number; readonly currency: Currency; readonly status: BookingStatus; }
export type Result<T,E> = { readonly ok:true; readonly value:T } | { readonly ok:false; readonly error:E };
export type BookingError = { readonly code:'INVALID_INPUT'|'PACKAGE_NOT_FOUND'|'DUPLICATE_ID'|'INVALID_TRANSITION'; readonly message:string };
export const catalog: readonly Package[] = [
 {id:'sylhet',title:'Sylhet Nature Escape',priceBDT:7500},
 {id:'cox',title:'Cox’s Bazar Weekend',priceBDT:12000},
 {id:'sreemangal',title:'Sreemangal Retreat',priceBDT:9000}
];
export function isRecord(v:unknown):v is Record<string,unknown>{return typeof v==='object'&&v!==null&&!Array.isArray(v)}
export interface CreateBookingInput { id:string; packageId:string; customerName:string; travelers:number }
export function parseBookingInput(value:unknown):Result<CreateBookingInput,BookingError>{
 const invalid=(message:string):Result<never,BookingError>=>({ok:false,error:{code:'INVALID_INPUT',message}});
 if(!isRecord(value))return invalid('Expected a JSON object');
 const {id,packageId,customerName,travelers}=value;
 if(typeof id!=='string'||!/^BK-[A-Za-z0-9-]{3,30}$/.test(id))return invalid('Invalid booking ID');
 if(typeof packageId!=='string'||!packageId.trim())return invalid('Package ID is required');
 if(typeof customerName!=='string'||customerName.trim().length<2||customerName.trim().length>80)return invalid('Customer name must be 2–80 characters');
 if(typeof travelers!=='number'||!Number.isSafeInteger(travelers)||travelers<1||travelers>20)return invalid('Travelers must be an integer from 1 to 20');
 return {ok:true,value:{id,packageId,customerName:customerName.trim(),travelers}};
}
export function assertNever(value:never):never{throw new Error(`Unhandled case: ${String(value)}`)}
export function statusLabel(status:BookingStatus):string{switch(status){case 'pending':return 'Awaiting confirmation';case 'confirmed':return 'Confirmed';case 'cancelled':return 'Cancelled';default:return assertNever(status)}}
export function calculateTotal(priceBDT:number,travelers:number):number{
 if(!Number.isSafeInteger(priceBDT)||priceBDT<0||!Number.isSafeInteger(travelers)||travelers<1)throw new RangeError('Invalid price or traveler count');
 const total=priceBDT*travelers;if(!Number.isSafeInteger(total))throw new RangeError('Total exceeds safe integer range');return total;
}
