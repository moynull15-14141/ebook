const getUser = async () => ({ id: 7, name: 'Sara' });
const getOrders = async (id) => [`${id}-A`, `${id}-B`];

async function showOrderCount() {
  const user = await getUser();
  const orders = await getOrders(user.id);
  console.log(`${user.name}: ${orders.length}টি Order`);
}

showOrderCount();
