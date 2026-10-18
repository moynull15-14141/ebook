// ৪,০০০ অনুরোধে ৩,৯৮০ সফল। SLO ৯৯.৯% হলে কী দাঁড়ায়?
const total = 4000;
const ok = 3980;
const slo = 0.999;

const successRate = ok / total;
const allowedFailures = total * (1 - slo);
const failures = total - ok;

console.log('Success Rate:', `${(successRate * 100).toFixed(1)}%`);
console.log('SLO অনুযায়ী অনুমোদিত ব্যর্থতা:', allowedFailures.toFixed(1));
console.log('আসল ব্যর্থতা:', failures);
console.log('Budget-এর', `${((failures / allowedFailures) * 100).toFixed(0)}%`,
  'খরচ; Burn Rate', ((1 - successRate) / (1 - slo)).toFixed(1));
console.log(successRate >= slo ? 'SLO পূরণ' : 'SLO পূরণ হয়নি');
