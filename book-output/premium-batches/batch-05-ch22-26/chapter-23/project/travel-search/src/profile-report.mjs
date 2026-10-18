// V8-এর CPU Profile (.cpuprofile-এর একই JSON) থেকে Self Time-এর তালিকা।
// প্রতিটি Sample মানে: সেই মুহূর্তে কোন Function চলছিল।
export function topFunctions(profile, limit = 5) {
  const counts = new Map();
  const byId = new Map(profile.nodes.map((node) => [node.id, node]));
  for (const id of profile.samples) {
    const { functionName, url, lineNumber } = byId.get(id).callFrame;
    const file = url.split('/').pop();
    const name = functionName
      ? `${functionName} (${file || 'native'}:${lineNumber + 1})`
      : `(${file || 'idle বা অন্যান্য'})`;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const total = profile.samples.length;
  return [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, n]) => ({ name, percent: ((n / total) * 100).toFixed(1) }));
}
