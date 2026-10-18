import { LiveHub } from './live-hub.mjs';

// শেখার জন্য স্থির Demo Token। Production-এ Login থেকে পাওয়া,
// মেয়াদযুক্ত Session Token ব্যবহার করুন (অধ্যায় ২০)।
export function createDemo(options = {}) {
  const hub = new LiveHub(options);
  const users = new Map([
    ['token-agent', { id: 'agent-1', role: 'agent', name: 'Nadia' }],
    ['token-rafi', { id: 'u-rafi', role: 'customer', name: 'Rafi' }],
    ['token-mina', { id: 'u-mina', role: 'customer', name: 'Mina' }],
  ]);
  for (const user of users.values()) hub.addUser(user);
  hub.createBooking('u-rafi', "Cox's Bazar, ৩ দিন");
  hub.createBooking('u-mina', 'Sylhet চা-বাগান, ২ দিন');
  return { hub, users };
}
