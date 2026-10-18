async function readJson(url) {
  const response = await fetch(url);
  console.log(`Status: ${response.status}, ok: ${response.ok}`);
  return response.json();
}

const url = 'data:application/json,{"name":"Sara","city":"Dhaka"}';

readJson(url).then((user) => console.log(`${user.name}, ${user.city}`));
