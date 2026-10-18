const wait = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// পুরোনো খোঁজার সাড়া ধীরে আসে, নতুনটির দ্রুত।
const searchServer = (query) =>
  wait(query === 'Ja' ? 300 : 100, `"${query}"-এর ফল`);

let shown = '';
let latest = 0;

async function onType(query, guard) {
  const ticket = ++latest;
  const result = await searchServer(query);

  if (guard && ticket !== latest) {
    console.log(`পুরোনো ফল বাদ: ${result}`);
    return;
  }
  shown = result;
}

async function demo(guard) {
  await Promise.all([onType('Ja', guard), onType('JavaScript', guard)]);
  console.log(`${guard ? 'Guard সহ' : 'Guard ছাড়া'}: পর্দায় ${shown}`);
}

demo(false).then(() => demo(true));
