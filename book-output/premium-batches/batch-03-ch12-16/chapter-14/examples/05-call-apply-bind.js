function describe(prefix, suffix) {
  return `${prefix} ${this.name}${suffix}`;
}

const user = { name: 'Sara' };

console.log(describe.call(user, 'নাম:', '।'));
console.log(describe.apply(user, ['নাম:', '!']));

const hello = describe.bind(user, 'হ্যালো,');
console.log(hello('!'));

console.log(Math.max.apply(null, [4, 9, 2]), Math.max(...[4, 9, 2]));
