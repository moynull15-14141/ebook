// ধীর Client-এর জন্য সীমিত Queue। তিনটি নীতি: পুরোনো ফেলা, একীকরণ, বিচ্ছিন্ন।
function createQueue({ limit, policy }) {
  const items = [];
  return {
    items,
    push(event) {
      if (policy === 'coalesce') {
        // একই Booking-এর পুরোনো Event থাকলে শুধু সর্বশেষটি রাখা।
        const i = items.findIndex((e) => e.bookingId === event.bookingId);
        if (i !== -1) items.splice(i, 1);
      }
      if (items.length < limit) return items.push(event) && 'queued';
      if (policy === 'drop-oldest' || policy === 'coalesce') {
        items.shift();
        items.push(event);
        return 'dropped-oldest';
      }
      return 'disconnect';
    },
  };
}

const burst = [1, 2, 3, 4, 5, 6].map((n) => ({
  bookingId: `bk-${n % 2 === 0 ? 'A' : 'B'}`, sequence: n }));
for (const policy of ['drop-oldest', 'coalesce', 'disconnect']) {
  const queue = createQueue({ limit: 3, policy });
  const results = burst.map((event) => queue.push(event));
  console.log(policy.padEnd(11), results.at(-1).padEnd(14),
    queue.items.map((e) => `${e.bookingId}#${e.sequence}`).join(' '));
}
