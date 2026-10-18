// ১০০ নম্বরের মূল্যায়ন: প্রতিটি ক্ষেত্রে নিজের নম্বর দিন, তারপর ব্যাখ্যা।
const rubric = [
  ['Requirement ও User Flow', 10],
  ['JavaScript-এর নকশা', 15],
  ['API ও Authentication', 15],
  ['Data-র সামঞ্জস্য', 15],
  ['Test ও Debugging', 15],
  ['নিরাপত্তা ও গোপনীয়তা', 10],
  ['Deployment ও Monitoring-এর পরিকল্পনা', 10],
  ['Documentation ও যোগাযোগ', 10],
];

function assess(scores) {
  const total = rubric.reduce((sum, [area, max]) => {
    const given = scores[area] ?? 0;
    if (given < 0 || given > max) throw new RangeError(`${area}: 0-${max}`);
    return sum + given;
  }, 0);
  const band = total >= 85 ? 'শক্তিশালী Capstone'
    : total >= 70 ? 'ভালো ভিত্তি'
      : total >= 50 ? 'নির্দিষ্ট উন্নতি দরকার' : 'Requirement ও Test আগে';
  const weakest = rubric.map(([area, max]) => [area, (scores[area] ?? 0) / max])
    .sort((a, b) => a[1] - b[1])[0][0];
  return { total, band, weakest };
}

console.log(assess({ 'Requirement ও User Flow': 9, 'JavaScript-এর নকশা': 13,
  'API ও Authentication': 13, 'Data-র সামঞ্জস্য': 14, 'Test ও Debugging': 13,
  'নিরাপত্তা ও গোপনীয়তা': 7, 'Deployment ও Monitoring-এর পরিকল্পনা': 5,
  'Documentation ও যোগাযোগ': 8 }));
