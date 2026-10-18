const log = 'ERROR 12:01 disk; WARN 12:05 cpu; ERROR 12:09 net';
const entry = /(?<level>ERROR|WARN) (?<time>\d{2}:\d{2}) (?<what>\w+)/g;

for (const match of log.matchAll(entry)) {
  console.log(match.index, match.groups.level, match.groups.what);
}

console.log(log.replace(entry, '$<time>=$<what>'));
console.log(log.replace(/\d{2}:\d{2}/g, (time) => time.replace(':', 'h')));
console.log('আম, কলা;লিচু  ,জাম'.split(/\s*[,;]\s*/));
