"use strict";
const lines=[];
const byId=id=>document.getElementById(id);
const {calculateInvoice,parseBdtToPaisa,formatBdt}=window.InvoiceEngine;
function basisPoints(id){const value=byId(id).value.trim();if(!/^(?:\d{1,3})(?:\.\d{1,2})?$/.test(value))throw new TypeError("Rate must have at most two decimal places");const result=Math.round(Number(value)*100);if(result>10000)throw new RangeError("Rate cannot exceed 100%");return result;}
function render(){
  const invoice=calculateInvoice(lines,{discountBps:basisPoints("discount"),taxBps:basisPoints("tax")});
  byId("lines").replaceChildren();
  for(const line of invoice.lines){const li=document.createElement("li");li.textContent=`${line.name}: ${line.quantity} × ${formatBdt(line.unitPricePaisa)} = ${formatBdt(line.lineTotalPaisa)}`;byId("lines").append(li);}
  const rows=[["Subtotal",invoice.subtotalPaisa],["Discount",invoice.discountPaisa],["Taxable amount",invoice.taxablePaisa],["Example tax",invoice.taxPaisa],["Grand total",invoice.totalPaisa]];
  byId("summary").replaceChildren();for(const [label,amount] of rows){const dt=document.createElement("dt");dt.textContent=label;const dd=document.createElement("dd");dd.textContent=formatBdt(amount);byId("summary").append(dt,dd);}
}
function safelyRender(){try{byId("error").textContent="";render();}catch(error){byId("error").textContent=error.message;}}
byId("line-form").addEventListener("submit",event=>{event.preventDefault();try{const line={name:byId("name").value.trim(),unitPricePaisa:parseBdtToPaisa(byId("price").value),quantity:Number(byId("quantity").value)};calculateInvoice([...lines,line]);lines.push(line);byId("line-form").reset();safelyRender();}catch(error){byId("error").textContent=error.message;}});
for(const id of ["discount","tax"])byId(id).addEventListener("input",safelyRender);
byId("clear").addEventListener("click",()=>{lines.length=0;safelyRender();});
safelyRender();
