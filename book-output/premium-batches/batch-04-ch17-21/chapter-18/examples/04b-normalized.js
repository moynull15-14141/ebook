const nested = [
  { id: 'O1', customer: { id: 'C1', name: 'Sara', city: 'Bogura' }, total: 500 },
  { id: 'O2', customer: { id: 'C1', name: 'Sara', city: 'Bogura' }, total: 300 },
];

function normalize(orders) {
  const customers = {};
  const byId = {};
  for (const { customer, ...order } of orders) {
    customers[customer.id] = customer;
    byId[order.id] = { ...order, customerId: customer.id };
  }
  return { orders: byId, customers };
}

const state = normalize(nested);
const moved = {
  ...state,
  customers: { ...state.customers, C1: { ...state.customers.C1, city: 'Dhaka' } },
};

const cityOf = (s, orderId) => s.customers[s.orders[orderId].customerId].city;
const count = Object.keys(state.customers).length;
console.log(count, cityOf(moved, 'O1'), cityOf(moved, 'O2'));
console.log(moved.orders === state.orders);
