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

const sendWelcome = once((email) => {
  console.log(`স্বাগত Email পাঠানো হলো: ${email}`);
  return true;
});

sendWelcome('sara@example.com');
sendWelcome('sara@example.com');
console.log(sendWelcome('other@example.com'));
