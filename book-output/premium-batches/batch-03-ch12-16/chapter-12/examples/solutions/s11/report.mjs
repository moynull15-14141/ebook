console.log('report.mjs লোড হলো');

export const buildReport = (sales) => `মোট বিক্রি: ${sales.reduce((a, b) => a + b, 0)}`;
