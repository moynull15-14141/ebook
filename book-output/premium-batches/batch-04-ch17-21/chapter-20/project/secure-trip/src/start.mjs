import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { createApp } from './app.mjs';
import { createDatabase } from './db.mjs';
import { createSessions } from './sessions.mjs';
import { createLimiter } from './limiter.mjs';
import { createLogger } from './log.mjs';
import { hashPassword } from './passwords.mjs';

// শুধু 127.0.0.1-এ শোনে: এই কম্পিউটারের বাইরে থেকে পৌঁছানো যায় না।
export async function startServer(options = {}) {
  const { port = 0, users = [], log = createLogger() } = options;
  const db = createDatabase();
  for (const { email, password, role } of users) {
    db.addUser(email, await hashPassword(password), role);
  }
  const dummyHash = await hashPassword(randomBytes(16).toString('hex'));
  const app = createApp({
    db, sessions: createSessions(), limiter: createLimiter(), log, dummyHash,
  });
  const server = createServer(app);
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}
