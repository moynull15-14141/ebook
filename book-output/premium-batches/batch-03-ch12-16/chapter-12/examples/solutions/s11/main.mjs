async function showReport(wanted) {
  if (!wanted) {
    return 'Report চাওয়া হয়নি';
  }
  const { buildReport } = await import('./report.mjs');
  return buildReport([1200, 800, 450]);
}

console.log(await showReport(false));
console.log(await showReport(true));
