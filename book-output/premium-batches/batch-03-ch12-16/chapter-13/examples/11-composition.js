class EmailNotifier {
  send(to, text) {
    return `Email (${to}): ${text}`;
  }
}

class SmsNotifier {
  send(to, text) {
    return `SMS (${to}): ${text}`;
  }
}

class OrderService {
  #notifier;

  constructor(notifier) {
    this.#notifier = notifier;
  }

  place(order) {
    return this.#notifier.send(order.contact, `Order ${order.id} গৃহীত`);
  }
}

const byEmail = new OrderService(new EmailNotifier());
const bySms = new OrderService(new SmsNotifier());

console.log(byEmail.place({ id: 7, contact: 'sara@example.com' }));
console.log(bySms.place({ id: 8, contact: '01700-000000' }));
