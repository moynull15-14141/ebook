const ok = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));
const fail = (ms, message) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));

async function main() {
  try {
    await Promise.all([ok(50, 'ক'), fail(100, 'খ ব্যর্থ'), ok(150, 'গ')]);
  } catch (error) {
    console.log(`all: ${error.message}`);
  }

  const settled = await Promise.allSettled([ok(50, 'ক'), fail(100, 'খ ব্যর্থ')]);
  const report = settled.map((result) =>
    result.status === 'fulfilled' ? result.value : result.reason.message);
  console.log(`allSettled: ${report.join(' | ')}`);

  const fastest = await Promise.race([ok(150, 'ধীর'), ok(50, 'দ্রুত')]);
  console.log(`race: ${fastest}`);

  const firstOk = await Promise.any([fail(50, 'x'), ok(100, 'প্রথম সফল')]);
  console.log(`any: ${firstOk}`);
}

main();
