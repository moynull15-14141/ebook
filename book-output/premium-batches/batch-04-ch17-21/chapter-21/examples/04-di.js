function createGreetingService({ repository, clock }) {
  return {
    greet(id) {
      const user = repository.find(id);
      const hour = clock().getHours();
      const part = hour < 12 ? 'সুপ্রভাত' : 'শুভ সন্ধ্যা';
      return user ? `${part}, ${user.name}` : 'অজানা ব্যবহারকারী';
    },
  };
}

// Test-এর জন্য: স্থির তথ্য ও স্থির ঘড়ি।
const fakeRepository = { find: (id) => (id === 1 ? { name: 'Mina' } : null) };
const morning = () => new Date(2026, 9, 15, 9, 0);
const evening = () => new Date(2026, 9, 15, 19, 0);

const at = (clock) =>
  createGreetingService({ repository: fakeRepository, clock });
console.log(at(morning).greet(1));
console.log(at(evening).greet(1));
console.log(at(morning).greet(2));
