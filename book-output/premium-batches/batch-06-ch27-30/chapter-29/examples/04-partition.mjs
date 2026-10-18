// Network Partition চলাকালে দুটি Replica: Consistency না Availability?
// শেষ আসনটি দুই শহরের দুই Agent একই সময়ে বিক্রি করতে চান।
function replica(name, seats) {
  return { name, seats, sold: [] };
}

function sell(r, agent, { partitioned, mode }) {
  if (partitioned && mode === 'CP') {
    return `${r.name}: প্রত্যাখ্যান (অন্য Replica-র সঙ্গে মিলানো যাচ্ছে না)`;
  }
  if (r.seats < 1) return `${r.name}: আসন নেই`;
  r.seats -= 1;
  r.sold.push(agent);
  return `${r.name}: ${agent}-এর কাছে বিক্রি`;
}

for (const mode of ['AP', 'CP']) {
  const dhaka = replica('Dhaka', 1);
  const ctg = replica('Chattogram', 1);
  console.log(`${mode}:`);
  console.log(' ', sell(dhaka, 'Agent-A', { partitioned: true, mode }));
  console.log(' ', sell(ctg, 'Agent-B', { partitioned: true, mode }));
  // Partition সারল; দুই Replica মিলিয়ে দেখা
  const sold = [...dhaka.sold, ...ctg.sold];
  console.log(`  মিলনের পর বিক্রি: ${sold.length} (আসন ছিল 1)`,
    sold.length > 1 ? 'Overbooking!' : 'ঠিক আছে');
}
