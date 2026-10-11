// SalesFlow Analytics: pure transformations, no mutation of caller-owned data.
export const sampleOrders = Object.freeze([
  {id:'S101',date:'2026-10-01',category:'Books',product:'JavaScript Guide',quantity:2,unitPrice:900,status:'paid'},
  {id:'S102',date:'2026-10-02',category:'Courses',product:'Web Fundamentals',quantity:1,unitPrice:2500,status:'paid'},
  {id:'S103',date:'2026-10-03',category:'Books',product:'CSS Handbook',quantity:3,unitPrice:650,status:'refunded'},
  {id:'S104',date:'2026-10-04',category:'Tools',product:'Editor License',quantity:2,unitPrice:1200,status:'paid'},
  {id:'S105',date:'2026-10-05',category:'Books',product:'JS Practice',quantity:1,unitPrice:1100,status:'paid'},
  {id:'S106',date:'2026-10-06',category:'Courses',product:'Advanced JS',quantity:2,unitPrice:3200,status:'paid'}
]);
export function normalizeOrder(order){
  if(!order || typeof order!=='object') throw new TypeError('Order must be an object');
  const id=String(order.id??'').trim();
  const category=String(order.category??'').trim();
  const product=String(order.product??'').trim();
  const quantity=Number(order.quantity),unitPrice=Number(order.unitPrice);
  const status=String(order.status??'').trim().toLowerCase();
  const date=String(order.date??'').trim();
  if(!id||!category||!product||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!['paid','refunded','pending'].includes(status))throw new TypeError('Invalid order metadata');
  if(!Number.isSafeInteger(quantity)||quantity<=0||!Number.isFinite(unitPrice)||unitPrice<0)throw new RangeError('Invalid quantity or price');
  return {id,date,category,product,quantity,unitPrice,status,total:quantity*unitPrice};
}
export function prepareOrders(raw){
  if(!Array.isArray(raw))throw new TypeError('Orders must be an array');
  const seen=new Set();
  return raw.map(normalizeOrder).map(order=>{
    if(seen.has(order.id))throw new Error('Duplicate order ID: '+order.id);
    seen.add(order.id);return order;
  });
}
export const paidOnly=orders=>orders.filter(order=>order.status==='paid');
export const sumRevenue=orders=>paidOnly(orders).reduce((sum,order)=>sum+order.total,0);
export const totalUnits=orders=>paidOnly(orders).reduce((sum,order)=>sum+order.quantity,0);
export function groupByCategory(orders){
  return paidOnly(orders).reduce((acc,order)=>{
    const previous=acc[order.category]??{category:order.category,revenue:0,units:0,orders:0};
    return {...acc,[order.category]:{...previous,revenue:previous.revenue+order.total,units:previous.units+order.quantity,orders:previous.orders+1}};
  },{});
}
export function rankCategories(orders){
  return Object.values(groupByCategory(orders)).sort((a,b)=>b.revenue-a.revenue||a.category.localeCompare(b.category));
}
export function filterOrders(orders,{category='all',query='',status='all'}={}){
  const term=String(query).trim().toLocaleLowerCase();
  return orders.filter(o=>(category==='all'||o.category===category)&&(status==='all'||o.status===status)&&(!term||[o.id,o.product,o.category].some(v=>v.toLocaleLowerCase().includes(term))));
}
export const pipe=(...functions)=>initial=>functions.reduce((value,fn)=>fn(value),initial);
export function summarize(raw,filters={}){
  const orders=filterOrders(prepareOrders(raw),filters);
  return {orders,revenue:sumRevenue(orders),units:totalUnits(orders),ranking:rankCategories(orders)};
}
