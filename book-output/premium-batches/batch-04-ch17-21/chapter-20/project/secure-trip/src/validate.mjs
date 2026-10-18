// দাম আসে Server-এর Catalog থেকে; Client-এর পাঠানো দাম কখনো নয়।
export const CATALOG = Object.freeze({
  'cox-3d': Object.freeze({ name: "Cox's Bazar, ৩ দিন", price: 12500 }),
  'sylhet-2d': Object.freeze({ name: 'Sylhet, ২ দিন', price: 8900 }),
  'sundarbans-3d': Object.freeze({ name: 'Sundarbans, ৩ দিন', price: 15800 }),
});

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY = 24 * 60 * 60 * 1000;

function checkDate(text, today) {
  if (typeof text !== 'string' || !DATE.test(text)) {
    return 'তারিখ YYYY-MM-DD আকারে দিন';
  }
  const date = new Date(`${text}T00:00:00Z`);
  if (date.toISOString().slice(0, 10) !== text) {
    return 'তারিখটি ক্যালেন্ডারে নেই';
  }
  const days = (date - Date.parse(today.toISOString().slice(0, 10))) / DAY;
  return days >= 1 && days <= 365 ? null : 'আগামীকাল থেকে এক বছরের মধ্যে';
}

export function validateTripRequest(body, today = new Date()) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, errors: { body: 'একটি JSON Object পাঠান' } };
  }
  const { packageId, travelers, startDate, note = '' } = body;
  const errors = {};
  if (typeof packageId !== 'string' || !Object.hasOwn(CATALOG, packageId)) {
    errors.packageId = 'অজানা Package';
  }
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 8) {
    errors.travelers = 'যাত্রী ১ থেকে ৮ জন';
  }
  const dateError = checkDate(startDate, today);
  if (dateError) {
    errors.startDate = dateError;
  }
  if (typeof note !== 'string' || note.length > 200) {
    errors.note = 'নোট সর্বোচ্চ ২০০ অক্ষরের লেখা';
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  const total = CATALOG[packageId].price * travelers;
  return { ok: true, value: { packageId, travelers, startDate, note, total } };
}
