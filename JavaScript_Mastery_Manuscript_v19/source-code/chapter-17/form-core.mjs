// FormShield: educational client-side validation. Always validate again on the server.
export const normalizeSpace = value => String(value ?? '').trim().replace(/\s+/gu,' ');
export function validateName(value) {
  const name=normalizeSpace(value);
  if(name.length<2||name.length>80) return {ok:false,error:'Name must be 2–80 characters'};
  if(!/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(name)) return {ok:false,error:'Use letters and common name punctuation'};
  return {ok:true,value:name};
}
export function validateEmail(value){
  const email=String(value??'').trim().toLowerCase();
  if(email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email))return {ok:false,error:'Invalid email format'};
  return {ok:true,value:email};
}
export function validatePhone(value){
  const phone=String(value??'').replace(/[\s()-]/g,'');
  if(!/^\+?[0-9]{7,15}$/.test(phone))return {ok:false,error:'Use 7–15 digits, optional +'};
  return {ok:true,value:phone};
}
export function validatePassword(value){
  const password=String(value??'');
  if(password.length<12||password.length>128)return {ok:false,error:'Password must be 12–128 characters'};
  if(!/[a-z]/.test(password)||!/[A-Z]/.test(password)||!/[0-9]/.test(password))return {ok:false,error:'Include upper, lower and digit'};
  return {ok:true,value:password};
}
export function validateRegistration(input){
  const rules={name:validateName,email:validateEmail,phone:validatePhone,password:validatePassword};
  const values={},errors={};
  for(const [key,validator] of Object.entries(rules)){
    const result=validator(input?.[key]);
    if(result.ok)values[key]=result.value;else errors[key]=result.error;
  }
  if(input?.consent!==true)errors.consent='Consent is required';
  return {ok:Object.keys(errors).length===0,values,errors};
}
export function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
export function maskEmail(value){const [local,domain]=String(value).split('@');return domain?`${local.slice(0,1)}***@${domain}`:'invalid';}
