import {sampleOrders,summarize} from './sales-core.mjs';
const query=document.querySelector('#query');
const category=document.querySelector('#category');
const status=document.querySelector('#status');
const body=document.querySelector('#rows');
const summary=document.querySelector('#summary');
const ranks=document.querySelector('#ranking');
const money=value=>new Intl.NumberFormat('en-BD',{style:'currency',currency:'BDT',maximumFractionDigits:0}).format(value);
const categories=[...new Set(sampleOrders.map(item=>item.category))].sort();
for(const value of categories){const option=document.createElement('option');option.value=value;option.textContent=value;category.append(option)}
function render(){
 const report=summarize(sampleOrders,{query:query.value,category:category.value,status:status.value});
 summary.textContent=`${report.orders.length} orders · ${report.units} paid units · Revenue ${money(report.revenue)}`;
 body.replaceChildren();ranks.replaceChildren();
 for(const order of report.orders){const tr=document.createElement('tr');for(const value of [order.id,order.product,order.category,order.status,order.quantity,money(order.total)]){const td=document.createElement('td');td.textContent=String(value);tr.append(td)}body.append(tr)}
 for(const item of report.ranking){const li=document.createElement('li');li.textContent=`${item.category}: ${money(item.revenue)} (${item.units} units)`;ranks.append(li)}
}
for(const control of [query,category,status])control.addEventListener('input',render);
render();
