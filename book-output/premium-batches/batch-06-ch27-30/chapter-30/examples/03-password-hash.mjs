import { hashPassword, verifyPassword }
  from '../project/travel-master-pro/src/passwords.mjs';

const password = 'long-password-123';
const first = hashPassword(password);
const second = hashPassword(password);

// একই Password, ভিন্ন Salt, তাই ভিন্ন Hash: দুই ব্যবহারকারীর একই
// Password থাকলেও Database দেখে তা বোঝা যায় না।
console.log('গঠন:', first.split('$').map((part, i) => (i === 0 ? part
  : `${part.length} অক্ষর`)).join(' | '));
console.log('দুটি Hash এক?', first === second);
console.log('সঠিক Password:', verifyPassword(password, first));
console.log('ভুল Password:', verifyPassword('long-password-124', first));
console.log('Hash-এ Password আছে?', first.includes(password));
