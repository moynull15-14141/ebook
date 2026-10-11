import {validateRegistration,maskEmail} from './form-core.mjs';
const form=document.querySelector('#form');
const output=document.querySelector('#output');
form.addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(form);
  const result=validateRegistration({name:data.get('name'),email:data.get('email'),phone:data.get('phone'),password:data.get('password'),consent:data.has('consent')});
  document.querySelectorAll('[data-error]').forEach(node=>node.textContent='');
  output.textContent='';
  if(!result.ok){for(const [key,message] of Object.entries(result.errors)){const target=document.querySelector(`[data-error="${key}"]`);if(target)target.textContent=message;}output.textContent='Please correct the highlighted fields.';return;}
  output.textContent=`Validated locally: ${result.values.name} (${maskEmail(result.values.email)}). No data was transmitted or stored.`;
  form.reset();
});
