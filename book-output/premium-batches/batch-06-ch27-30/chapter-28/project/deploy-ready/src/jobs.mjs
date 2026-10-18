// Domain: Travel Operations-এর কাজ (যেমন "হোটেল Booking যাচাই")।
// Storage Interface async, যাতে পরে Database বসানো যায় (অধ্যায় ২৬)।
export const PRIORITIES = ['low', 'normal', 'high'];

export class ValidationError extends Error {
  constructor(details) {
    super('Input যাচাইয়ে ব্যর্থ');
    this.details = details;
  }
}

export function validateJob(input) {
  const details = [];
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  const priority = input?.priority ?? 'normal';
  if (title.length < 3 || title.length > 120) {
    details.push('title: ৩ থেকে ১২০ অক্ষর');
  }
  if (!PRIORITIES.includes(priority)) {
    details.push(`priority: ${PRIORITIES.join(', ')}`);
  }
  if (details.length) throw new ValidationError(details);
  return { title, priority };
}

export function createMemoryJobStore({ now = () => new Date() } = {}) {
  const jobs = [];
  return {
    async list() {
      return jobs.map((job) => ({ ...job }));
    },
    async create(input) {
      const job = { id: jobs.length + 1, ...validateJob(input),
        status: 'open', createdAt: now().toISOString() };
      jobs.push(job);
      return { ...job };
    },
    async ping() {
      return true;
    },
  };
}
