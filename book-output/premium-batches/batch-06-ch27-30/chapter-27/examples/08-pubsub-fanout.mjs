// দুটি Gateway Instance, মাঝে একটি Broker। এখানে Broker একটি সাধারণ
// in-memory অনুকরণ, যা Redis Pub/Sub-এর মূল আচরণ দেখায়; আসল Redis নয়।
class PubSub {
  #channels = new Map();
  subscribe(channel, fn) {
    const set = this.#channels.get(channel) ?? new Set();
    set.add(fn);
    this.#channels.set(channel, set);
    return () => set.delete(fn);
  }
  publish(channel, message) {
    // শুধু এই মুহূর্তের Subscriber পায়; কোনো History জমা থাকে না।
    for (const fn of this.#channels.get(channel) ?? []) fn(message);
  }
}

function gateway(name, broker) {
  const local = new Map(); // এই Instance-এ যুক্ত Client
  return {
    connect(client, room) {
      local.set(client, room);
      return broker.subscribe(room, (msg) => {
        if (local.get(client) === room) console.log(`  ${name}/${client}:`, msg);
      });
    },
    publish: (room, msg) => broker.publish(room, msg),
  };
}

const broker = new PubSub();
const a = gateway('A', broker);
const b = gateway('B', broker);
a.connect('rafi-phone', 'booking:bk-1');
const leave = b.connect('agent-laptop', 'booking:bk-1');

console.log('Instance A থেকে Publish:');
a.publish('booking:bk-1', { sequence: 2, status: 'CONFIRMED' });
leave();
console.log('Agent offline থাকাকালে Publish:');
b.publish('booking:bk-1', { sequence: 3, status: 'CANCELLED' });
b.connect('agent-laptop', 'booking:bk-1');
console.log('Agent ফিরে এল; #3 আর আসবে না, Snapshot/Replay লাগবে');
