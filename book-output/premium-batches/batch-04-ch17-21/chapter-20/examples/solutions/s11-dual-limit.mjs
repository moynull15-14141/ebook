import { createLimiter } from '../../project/secure-trip/src/limiter.mjs';

const byEmail = createLimiter({ max: 5 });
const byIp = createLimiter({ max: 20 });

function attempt(ip, email, success) {
  if (byIp.blocked(ip) || byEmail.blocked(email)) {
    return 429;
  }
  if (success) {
    byEmail.reset(email);
    return 200;
  }
  byIp.fail(ip);
  byEmail.fail(email);
  return 401;
}

const statuses = [];
for (let i = 0; i < 22; i += 1) {
  statuses.push(attempt('10.0.0.7', `user${i}@example.com`, false));
}
console.log(statuses.slice(-3).join(' '));
console.log(attempt('10.0.0.8', 'user1@example.com', true));
