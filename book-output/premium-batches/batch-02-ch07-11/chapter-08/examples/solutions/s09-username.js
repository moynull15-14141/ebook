const isValidUsername = (name) => /^[a-z][a-z0-9_]{2,14}$/.test(name);

console.log(isValidUsername('sara_88'));
console.log(isValidUsername('8sara'));
console.log(isValidUsername('sa'));
console.log(isValidUsername('Sara'));
