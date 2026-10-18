const fresh = {};
const custom = { pageSize: 0 };

fresh.pageSize ??= 20;
custom.pageSize ??= 20;

console.log(fresh.pageSize, custom.pageSize);
