function once(fn) {
  let done = false;
  let result;

  return (...args) => {
    if (!done) {
      done = true;
      result = fn(...args);
    }
    return result;
  };
}

function logged(fn) {
  return (...args) => {
    const result = fn(...args);
    console.log(`${fn.name}(${args.join(', ')}) = ${result}`);
    return result;
  };
}

const connect = once(() => {
  console.log('সংযোগ তৈরি');
  return 'connection-1';
});
console.log(connect(), connect());

const add = (a, b) => a + b;
const loggedAdd = logged(add);
console.log(loggedAdd(2, 3) * 10);
