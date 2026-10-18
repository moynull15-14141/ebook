// পরীক্ষার জন্য একটি কৃত্রিম fetch: আসল Network ছাড়াই নির্দিষ্ট সাড়া দেয়।
const fakeFetch = async (url) =>
  url.endsWith('/users')
    ? new Response('[{"id":1},{"id":2}]', { status: 200 })
    : new Response('Not Found', { status: 404 });

async function getJson(url) {
  const response = await fakeFetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function main() {
  for (const url of ['/api/users', '/api/userz']) {
    try {
      const data = await getJson(url);
      console.log(`${url}: ${data.length}টি User`);
    } catch (error) {
      console.log(`${url}: ব্যর্থ, ${error.message}`);
    }
  }
}

main();
