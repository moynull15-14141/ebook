// Memory-ভিত্তিক Repository; প্রতিটি Method async, যাতে পরে Database Adapter
// (অধ্যায় ২৬) একই চুক্তিতে বসানো যায়। সব তথ্য Copy হিসেবে দেওয়া-নেওয়া।
export function createLeadRepository() {
  const leads = new Map();
  let sequence = 0;
  const copy = (lead) => structuredClone(lead);

  return {
    async nextId() {
      sequence += 1;
      return `L-${String(sequence).padStart(5, '0')}`;
    },
    async insert(lead) {
      leads.set(lead.id, copy(lead));
    },
    async get(id) {
      return leads.has(id) ? copy(leads.get(id)) : null;
    },
    // শর্তসাপেক্ষ হালনাগাদ: সংরক্ষিত version মিললে তবেই (Optimistic Concurrency)।
    async replace(lead, expectedVersion) {
      if (leads.get(lead.id)?.version !== expectedVersion) {
        return false;
      }
      leads.set(lead.id, copy(lead));
      return true;
    },
    async remove(id) {
      return leads.delete(id);
    },
    // Cursor Pagination: id-র ক্রমে, after-এর পরের limit-টি, এবং আরও আছে কি না।
    async list({ where = () => true, after = '', limit = 20 }) {
      const rows = [...leads.values()]
        .filter((lead) => lead.id > after && where(lead))
        .slice(0, limit + 1);
      const items = rows.slice(0, limit).map(copy);
      return { items, hasMore: rows.length > limit };
    },
  };
}
