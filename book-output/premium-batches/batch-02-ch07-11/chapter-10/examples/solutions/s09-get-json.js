const responses = {
  '/ok': () => new Response('{"total":5}', { status: 200 }),
  '/missing': () => new Response('', { status: 404 }),
  '/broken': () => new Response('{oops', { status: 200 }),
};
const fakeFetch = async (url) => responses[url]();

async function getJson(url) {
  const response = await fakeFetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function main() {
  for (const url of Object.keys(responses)) {
    try {
      const data = await getJson(url);
      console.log(`${url}: total ${data.total}`);
    } catch (error) {
      const reason = error instanceof SyntaxError ? 'ভাঙা JSON' : error.message;
      console.log(`${url}: ${reason}`);
    }
  }
}

main();
