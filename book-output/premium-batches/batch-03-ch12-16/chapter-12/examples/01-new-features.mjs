const scores = [72, 95, 58];

console.log(scores.toSorted((a, b) => b - a));
console.log(scores.toReversed());
console.log(scores.with(0, 80));
console.log(scores);

const settings = { theme: '', fontSize: 0 };
settings.theme ||= 'light';
settings.fontSize ??= 16;
settings.language ??= 'bn';
console.log(settings);

console.log(1_500_000 + 250_000);
