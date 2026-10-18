// নাম ধরে File আনে, সর্বোচ্চ batchSize একসঙ্গে; ব্যর্থ File বাকিদের থামায় না।
export async function loadInBatches(names, loader, batchSize = 2) {
  const records = [];
  const failures = [];

  for (let i = 0; i < names.length; i += batchSize) {
    const batch = names.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map((name) => loader(name)));
    results.forEach((result, j) => {
      if (result.status === 'fulfilled') {
        records.push(...result.value);
      } else {
        failures.push(`${batch[j]}: ${result.reason.message}`);
      }
    });
  }
  return { records, failures };
}
