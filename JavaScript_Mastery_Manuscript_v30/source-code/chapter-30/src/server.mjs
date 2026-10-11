import { createServer } from 'node:http';
import { TravelMaster, AppError } from './domain.mjs';
const app=new TravelMaster();
const maxBytes=16*1024;
const send=(res,status,data,extra={})=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...extra});res.end(JSON.stringify(data));};
async function readJson(req){let total=0;const parts=[];for await(const chunk of req){total+=chunk.length;if(total>maxBytes)throw new AppError(413,'TOO_LARGE','Body too large');parts.push(chunk);}
 try{const value=JSON.parse(Buffer.concat(parts).toString('utf8'));if(!value||Array.isArray(value)||typeof value!=='object')throw Error();return value;}
 catch{throw new AppError(400,'INVALID_JSON','JSON object required');}}
const bearer=req=>{const h=req.headers.authorization||'';return h.startsWith('Bearer ')?h.slice(7):'';};
export function createAppServer(service=new TravelMaster()){
 return createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');const path=url.pathname;const method=req.method;
  try{
   if(method==='GET'&&path==='/health')return send(res,200,{status:'ok'});
   if(method==='GET'&&path==='/api/packages')return send(res,200,{data:service.listPackages()});
   if(method==='POST'&&path==='/api/register')return send(res,201,{data:service.register(await readJson(req))});
   if(method==='POST'&&path==='/api/login')return send(res,200,{data:service.login(await readJson(req))});
   if(method==='POST'&&path==='/api/logout'){service.logout(bearer(req));return send(res,200,{ok:true});}
   if(method==='GET'&&path==='/api/bookings'){const userId=service.authenticate(bearer(req));return send(res,200,{data:service.myBookings(userId)});}
   if(method==='POST'&&path==='/api/bookings'){const userId=service.authenticate(bearer(req));return send(res,201,{data:service.createBooking(userId,await readJson(req))});}
   const match=path.match(/^\/api\/bookings\/([\w-]+)\/cancel$/);
   if(method==='PATCH'&&match){const userId=service.authenticate(bearer(req));return send(res,200,{data:service.cancelBooking(userId,match[1])});}
   return send(res,404,{error:{code:'NOT_FOUND',message:'Route not found'}});
  }catch(err){if(err instanceof AppError)return send(res,err.status,{error:{code:err.code,message:err.message}});
   console.error('Unexpected server error',err);return send(res,500,{error:{code:'INTERNAL',message:'Internal server error'}});}
 });
}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href){
 const port=Number(process.env.PORT||3000);const server=createAppServer(app);
 server.listen(port,'127.0.0.1',()=>console.log(`TravelMaster Pro demo: http://127.0.0.1:${port}`));
 process.on('SIGTERM',()=>server.close());process.on('SIGINT',()=>server.close());
}
