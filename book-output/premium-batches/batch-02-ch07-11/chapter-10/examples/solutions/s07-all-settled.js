function request(name, succeeds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (succeeds) {
        resolve(`${name} সফল`);
      } else {
        reject(new Error(`${name} ব্যর্থ`));
      }
    }, 50);
  });
}

async function main() {
  const results = await Promise.allSettled([
    request('Profile', true),
    request('Orders', false),
    request('Settings', true),
  ]);

  for (const result of results) {
    const ok = result.status === 'fulfilled';
    console.log(ok ? result.value : result.reason.message);
  }
}

main();
