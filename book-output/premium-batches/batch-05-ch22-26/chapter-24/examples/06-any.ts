const text = '{ "name": 42 }';
const data: any = JSON.parse(text);

try {
  console.log(data.name.toUpperCase());
} catch (error) {
  console.log(`Runtime-এ ধরা পড়ল: ${(error as Error).message}`);
}
