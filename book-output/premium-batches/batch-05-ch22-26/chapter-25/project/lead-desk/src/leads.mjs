import { badRequest, conflict } from './errors.mjs';

// Lead: ভ্রমণ সংস্থার কাছে একজন সম্ভাব্য গ্রাহকের জিজ্ঞাসা।
export const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'];
const NEXT = {
  new: ['contacted', 'lost'],
  contacted: ['quoted', 'lost'],
  quoted: ['won', 'lost'],
  won: [],
  lost: [],
};
const PHONE = /^01[3-9]\d{8}$/;

function check(problems, ok, field, message) {
  if (!ok) {
    problems.push({ field, message });
  }
}

export function validateNewLead(body) {
  const b = typeof body === 'object' && body !== null ? body : {};
  const problems = [];
  const text = (v, max) =>
    typeof v === 'string' && v.trim().length > 0 && v.length <= max;
  check(problems, text(b.name, 80), 'name', 'নাম ১-৮০ অক্ষর');
  check(problems, typeof b.phone === 'string' && PHONE.test(b.phone), 'phone',
    '১১ অঙ্কের বাংলাদেশি মোবাইল নম্বর');
  check(problems, text(b.destination, 60), 'destination', 'গন্তব্য প্রয়োজন');
  check(problems, Number.isInteger(b.travelers) && b.travelers >= 1
    && b.travelers <= 50, 'travelers', 'যাত্রী ১ থেকে ৫০ জন');
  if (problems.length > 0) {
    throw badRequest('ইনপুট যাচাই ব্যর্থ', problems);
  }
  return {
    name: b.name.trim(), phone: b.phone, destination: b.destination.trim(),
    travelers: b.travelers,
  };
}

export function assertTransition(from, to) {
  if (!STATUSES.includes(to)) {
    throw badRequest(`অজানা অবস্থা: ${to}`);
  }
  if (!NEXT[from].includes(to)) {
    throw conflict('INVALID_TRANSITION', `${from} থেকে ${to} যাওয়া যায় না`);
  }
}
