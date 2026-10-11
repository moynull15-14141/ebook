export const DESTINATIONS=Object.freeze(['Dhaka','Cox’s Bazar','Sylhet','Bandarban','Rangamati','Sreemangal']);
export function makeTrips(count=12000){
 if(!Number.isSafeInteger(count)||count<0||count>100000)throw new RangeError('Invalid trip count');
 return Array.from({length:count},(_,i)=>({id:i+1,title:`${DESTINATIONS[i%DESTINATIONS.length]} Escape ${i+1}`,destination:DESTINATIONS[i%DESTINATIONS.length],price:1500+(i*137)%18000,rating:3+(i%21)/10}));
}
export function normalizeQuery(q){return String(q??'').normalize('NFC').trim().toLocaleLowerCase()}
export function filterTrips(trips,{query='',destination='all',maxPrice=Infinity}={}){
 const q=normalizeQuery(query); const price=Number(maxPrice);
 if(Number.isNaN(price)||price<0)throw new RangeError('Invalid max price');
 return trips.filter(t=>(destination==='all'||t.destination===destination)&&t.price<=price&&(!q||normalizeQuery(t.title).includes(q)||normalizeQuery(t.destination).includes(q)));
}
export function sortTrips(trips,mode='price-asc'){
 const cmp={ 'price-asc':(a,b)=>a.price-b.price||a.id-b.id,'price-desc':(a,b)=>b.price-a.price||a.id-b.id,'rating-desc':(a,b)=>b.rating-a.rating||a.id-b.id,'title':(a,b)=>a.title.localeCompare(b.title)||a.id-b.id}[mode];
 if(!cmp)throw new RangeError('Invalid sort mode');return [...trips].sort(cmp);
}
export function windowRange({scrollTop=0,rowHeight=56,viewportHeight=480,total=0,overscan=5}={}){
 if(!Number.isFinite(scrollTop)||scrollTop<0||!Number.isFinite(rowHeight)||rowHeight<=0||!Number.isFinite(viewportHeight)||viewportHeight<0||!Number.isSafeInteger(total)||total<0||!Number.isSafeInteger(overscan)||overscan<0)throw new RangeError('Invalid viewport');
 const start=Math.max(0,Math.floor(scrollTop/rowHeight)-overscan);
 const end=Math.min(total,Math.ceil((scrollTop+viewportHeight)/rowHeight)+overscan);
 return {start,end,offset:start*rowHeight,totalHeight:total*rowHeight};
}
export function debounce(fn,wait=200){let timer;const wrapped=(...args)=>{clearTimeout(timer);timer=setTimeout(()=>fn(...args),wait)};wrapped.cancel=()=>clearTimeout(timer);return wrapped}
export function memoizeLast(fn){let prevKey,prevValue,has=false;return (key)=>{if(has&&Object.is(key,prevKey))return prevValue;prevKey=key;prevValue=fn(key);has=true;return prevValue}}
