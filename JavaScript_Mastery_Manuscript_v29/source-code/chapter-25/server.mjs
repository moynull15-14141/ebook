import http from 'node:http';
import {randomBytes,createHash} from 'node:crypto';
import {packages} from './catalog.mjs';
import {createService,DomainError} from './core.mjs';
import {MemoryRepository} from './repository.mjs';
const repository=new MemoryRepository();const service=createService({repository});
const sessions=new Map();const port=Number(process.env.PORT||3000);
const send=(res,status,body,extra={})=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...extra});res.end(JSON.stringify(body))};
const readJSON=async req=>{let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>16384)throw new DomainError(413,'TOO_LARGE','Request body too large')}try{return JSON.parse(text)}catch{throw new DomainError(400,'INVALID_JSON','Invalid JSON')}};
const cookieToken=req=>{const match=/(?:^|; )sid=([^;]+)/.exec(req.headers.cookie||'');return match?.[1]||''};
const userIdFromSession=req=>{const token=cookieToken(req);const key=createHash('sha256').update(token).digest('hex');return sessions.get(key)};
const requireUser=req=>{const id=userIdFromSession(req);if(!id)throw new DomainError(401,'UNAUTHORIZED','Login required');return id};
const handler=async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');const path=url.pathname;
 if(req.method==='GET'&&path==='/health')return send(res,200,{status:'ok'});
 if(req.method==='GET'&&path==='/api/packages')return send(res,200,packages);
 if(req.method==='POST'&&path==='/api/register')return send(res,201,service.register(await readJSON(req)));
 if(req.method==='POST'&&path==='/api/login'){
  const user=service.authenticate(await readJSON(req));const token=randomBytes(32).toString('hex');sessions.set(createHash('sha256').update(token).digest('hex'),user.id);
  return send(res,200,user,{'set-cookie':`sid=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600${process.env.NODE_ENV==='production'?'; Secure':''}`});
 }
 if(req.method==='POST'&&path==='/api/logout'){
  const token=cookieToken(req);sessions.delete(createHash('sha256').update(token).digest('hex'));
  return send(res,200,{ok:true},{'set-cookie':'sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'});
 }
 if(req.method==='GET'&&path==='/api/bookings')return send(res,200,service.list(requireUser(req)));
 if(req.method==='POST'&&path==='/api/bookings')return send(res,201,service.book(requireUser(req),await readJSON(req)));
 const match=/^\/api\/bookings\/([a-f0-9-]+)\/cancel$/.exec(path);
 if(req.method==='PATCH'&&match)return send(res,200,service.cancel(requireUser(req),match[1]));
 return send(res,404,{error:'NOT_FOUND',message:'Route not found'});
 }catch(error){if(error instanceof DomainError)return send(res,error.status,{error:error.code,message:error.message});console.error(error);return send(res,500,{error:'INTERNAL_ERROR',message:'Unexpected server error'})}};
export function createApp(){return http.createServer(handler)}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href){createApp().listen(port,()=>console.log(`TravelCore listening on http://localhost:${port}`))}
