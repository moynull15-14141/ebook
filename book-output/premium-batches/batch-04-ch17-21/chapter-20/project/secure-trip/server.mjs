import { randomBytes } from 'node:crypto';
import { startServer } from './src/start.mjs';

// Demo Password Code-এ লেখা নেই: Environment Variable, নয়তো প্রতি চালানোয় নতুন।
const password = process.env.SECURETRIP_DEMO_PASSWORD
  ?? randomBytes(9).toString('base64url');
const users = [
  { email: 'rafi@example.com', role: 'customer' },
  { email: 'mina@example.com', role: 'customer' },
  { email: 'admin@example.com', role: 'admin' },
].map((user) => ({ ...user, password }));

const port = Number(process.env.PORT ?? 3020);
const { url } = await startServer({ port, users });
console.log(`SecureTrip (শিক্ষামূলক Demo, শুধু এই কম্পিউটারে): ${url}`);
console.log(`ব্যবহারকারী: ${users.map((user) => user.email).join(', ')}`);
if (!process.env.SECURETRIP_DEMO_PASSWORD) {
  console.log(`এই চালানোর Demo Password: ${password}`);
}
