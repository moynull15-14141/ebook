const fetchData = async () => [10, 20, 30];

async function main() {
  const data = await fetchData();
  console.log(data.length);
}

main();
