import {BookingService,InMemoryBookingRepository} from './service.js';
import {catalog,isRecord,type BookingStatus} from './domain.js';
// Transport-agnostic API adapter: can later be mounted in Express or Fetch-based server.
export interface ApiResponse { readonly status:number; readonly body:unknown }
const service=new BookingService(new InMemoryBookingRepository());
export function handleRequest(method:string,path:string,body:unknown):ApiResponse {
 if(method==='GET'&&path==='/api/packages')return {status:200,body:catalog};
 if(method==='GET'&&path==='/api/bookings')return {status:200,body:service.list()};
 if(method==='POST'&&path==='/api/bookings'){
  const result=service.create(body);return result.ok?{status:201,body:result.value}:{status:result.error.code==='DUPLICATE_ID'?409:result.error.code==='PACKAGE_NOT_FOUND'?404:400,body:result.error};
 }
 const match=/^\/api\/bookings\/(BK-[A-Za-z0-9-]{3,30})\/status$/.exec(path);
 if(method==='PATCH'&&match){
  const id=match[1];if(!id||!isRecord(body)||!['confirmed','cancelled'].includes(String(body.status)))return {status:400,body:{error:'Invalid status request'}};
  const result=service.changeStatus(id,body.status as BookingStatus);
  return result.ok?{status:200,body:result.value}:{status:result.error.code==='INVALID_TRANSITION'?409:404,body:result.error};
 }
 return {status:404,body:{error:'Route not found'}};
}
