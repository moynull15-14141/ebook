const TIERS = [
  { from: 1, bp: 200, min: 5_000 },
  { from: 100_000, bp: 150, min: 5_000 },
  { from: 1_000_000, bp: 100, min: 15_000 },
];
const MAX = 50_000_000;

// mutant: Code-এ একটি ছোট, ইচ্ছাকৃত পরিবর্তন।
function makeFee(mutant = '') {
  return (minor) => {
    const over = mutant === 'max>=' ? minor >= MAX : minor > MAX;
    if (minor < 1 || over) {
      throw new RangeError('সীমার বাইরে');
    }
    const fits = (t) => (mutant === 'from>' ? minor > t.from : minor >= t.from);
    const tier = TIERS.findLast(fits) ?? TIERS[0];
    const min = mutant === 'cliff' && tier.from === 100_000 ? 1_500 : tier.min;
    const half = mutant === 'truncate' ? 0n : 5_000n;
    const percent = Number((BigInt(minor) * BigInt(tier.bp) + half) / 10_000n);
    return Math.max(min, percent);
  };
}

const rows = [[1, 5_000], [99_999, 5_000], [100_000, 5_000],
  [333_334, 5_000], [333_367, 5_001], [999_999, 15_000],
  [1_000_000, 15_000], [MAX, 500_000]];

const killedBy = (fee) => rows.find(([minor, expected]) => {
  try {
    return fee(minor) !== expected;
  } catch {
    return true;
  }
});

console.log(`আসল Code: ${killedBy(makeFee()) ? 'ব্যর্থ' : 'সব পাস'}`);
for (const mutant of ['cliff', 'truncate', 'max>=', 'from>']) {
  const row = killedBy(makeFee(mutant));
  console.log(`${mutant.padEnd(8)} ${row ? `ধরা পড়েছে (${row[0]} পয়সায়)` : 'টিকে গেছে'}`);
}
