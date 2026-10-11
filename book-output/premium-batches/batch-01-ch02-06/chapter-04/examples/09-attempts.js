const maxAttempts = 3;
let attempt = 0;

do {
  attempt++;
  console.log(`চেষ্টা ${attempt}`);
} while (attempt < maxAttempts);
