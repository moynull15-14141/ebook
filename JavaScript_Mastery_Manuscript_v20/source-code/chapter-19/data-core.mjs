// DataPulse: deterministic data generation and pure query functions.
export function createDataset(count=10000){
  if(!Number.isSafeInteger(count)||count<0||count>100000)throw new RangeError('Count must be 0..100000');
  const categories=['Travel','Books','Courses','Tools','Services'];
  return Array.from({length:count},(_,i)=>({
    id:i+1, name:`Item ${String(i+1).padStart(6,'0')}`,
    category:categories[i%categories.length], price:100+((i*37)%4900),
    score:(i*17)%101
  }));
}
export function queryDataset(items,{search='',category='all',sort='id-asc'}={}){
  if(!Array.isArray(items))throw new TypeError('items must be an array');
  const q=String(search).trim().toLocaleLowerCase();
  const filtered=items.filter(item=>(category==='all'||item.category===category)
    &&(!q||item.name.toLocaleLowerCase().includes(q)||String(item.id).includes(q)));
  const compare={
    'id-asc':(a,b)=>a.id-b.id,
    'price-asc':(a,b)=>a.price-b.price||a.id-b.id,
    'price-desc':(a,b)=>b.price-a.price||a.id-b.id,
    'score-desc':(a,b)=>b.score-a.score||a.id-b.id
  }[sort];
  if(!compare)throw new RangeError('Unsupported sort');
  return filtered.sort(compare);
}
export function summarize(items){
  if(!Array.isArray(items))throw new TypeError('items must be an array');
  let total=0,min=Infinity,max=-Infinity;
  for(const item of items){total+=item.price;min=Math.min(min,item.price);max=Math.max(max,item.price)}
  return {count:items.length,total,average:items.length?total/items.length:0,
    min:items.length?min:0,max:items.length?max:0};
}
export function windowRange(total,scrollTop,rowHeight,viewportHeight,overscan=5){
  if(![total,scrollTop,rowHeight,viewportHeight,overscan].every(Number.isFinite)||
    total<0||scrollTop<0||rowHeight<=0||viewportHeight<0||overscan<0)throw new RangeError('Invalid window dimensions');
  const start=Math.max(0,Math.floor(scrollTop/rowHeight)-Math.floor(overscan));
  const end=Math.min(total,Math.ceil((scrollTop+viewportHeight)/rowHeight)+Math.ceil(overscan));
  return {start:Math.min(start,total),end:Math.max(Math.min(start,total),end)};
}
export function debounce(fn,delay=200){
  if(typeof fn!=='function'||!Number.isFinite(delay)||delay<0)throw new TypeError('Invalid debounce arguments');
  let timer;
  function wrapped(...args){clearTimeout(timer);timer=setTimeout(()=>fn.apply(this,args),delay)}
  wrapped.cancel=()=>clearTimeout(timer);
  return wrapped;
}
export function measure(label,fn){
  const start=performance.now();const value=fn();
  return {label,value,milliseconds:performance.now()-start};
}
