import {createDataset,queryDataset,summarize,windowRange,debounce,measure} from './data-core.mjs';
const $=id=>document.getElementById(id);
const all=createDataset(10000);
const rowHeight=40,overscan=6;
let results=all;
let frame=0;
function render(){
  const viewport=$('viewport');
  const {start,end}=windowRange(results.length,viewport.scrollTop,rowHeight,viewport.clientHeight,overscan);
  const fragment=document.createDocumentFragment();
  for(const item of results.slice(start,end)){
    const row=document.createElement('div');row.className='row';
    for(const value of [item.id,item.name,item.category,`৳${item.price.toLocaleString('en-US')}`,item.score]){
      const cell=document.createElement('span');cell.textContent=String(value);row.append(cell);
    }
    fragment.append(row);
  }
  const rows=$('rows');rows.replaceChildren(fragment);
  rows.style.transform=`translateY(${start*rowHeight}px)`;
  $('spacer').style.height=`${results.length*rowHeight}px`;
  $('rendered').textContent=String(end-start);
}
function scheduleRender(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;render()})}
function applyQuery(){
  const {value,milliseconds}=measure('filter and sort',()=>queryDataset(all,{
    search:$('search').value,category:$('category').value,sort:$('sort').value}));
  results=value;
  const stats=summarize(results);
  $('count').textContent=stats.count.toLocaleString('en-US');
  $('average').textContent=`৳${stats.average.toFixed(2)}`;
  $('query-time').textContent=`${milliseconds.toFixed(2)} ms`;
  $('status').textContent=`${stats.count.toLocaleString('en-US')} matching records`;
  $('viewport').scrollTop=0;render();
}
$('search').addEventListener('input',debounce(applyQuery,180));
$('category').addEventListener('change',applyQuery);
$('sort').addEventListener('change',applyQuery);
$('viewport').addEventListener('scroll',scheduleRender,{passive:true});
$('reset').addEventListener('click',()=>{$('search').value='';$('category').value='all';$('sort').value='id-asc';applyQuery()});
applyQuery();
