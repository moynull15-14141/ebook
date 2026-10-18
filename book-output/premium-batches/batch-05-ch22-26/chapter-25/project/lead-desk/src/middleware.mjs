import { randomUUID } from 'node:crypto';
import { AppError, unauthorized } from './errors.mjs';
import { hashToken } from './config.mjs';

// প্রতিটি অনুরোধের একটি ID: Response Header-এ ও প্রতিটি Log-এ।
export function requestId(req, res, next) {
  const incoming = req.get('x-request-id');
  req.id = incoming && /^[\w-]{1,64}$/.test(incoming) ? incoming : randomUUID();
  res.set('x-request-id', req.id);
  next();
}

// Structured Log: একটি অনুরোধ, একটি JSON লাইন। Header বা Body Log হয় না।
export const requestLogger = (log) => (req, res, next) => {
  const started = process.hrtime.bigint();
  res.on('finish', () => log({
    requestId: req.id, method: req.method, path: req.path,
    status: res.statusCode,
    user: req.user?.id ?? null,
    ms: Number(process.hrtime.bigint() - started) / 1e6,
  }));
  next();
};

export const authenticate = (users) => (req, res, next) => {
  const [scheme, token] = (req.get('authorization') ?? '').split(' ');
  const valid = scheme === 'Bearer' && Boolean(token);
  const user = valid ? users.get(hashToken(token)) : undefined;
  if (!user) {
    next(unauthorized());
    return;
  }
  req.user = user;
  next();
};

// প্রতি ব্যবহারকারী নির্দিষ্ট সময়-জানালায় সর্বোচ্চ max অনুরোধ।
export function rateLimit({ max, windowMs, now = Date.now }) {
  const windows = new Map();
  return (req, res, next) => {
    const key = req.user?.id ?? req.ip;
    const current = windows.get(key);
    const window = current && now() - current.start < windowMs
      ? current : { start: now(), count: 0 };
    window.count += 1;
    windows.set(key, window);
    if (window.count > max) {
      const retry = Math.ceil((window.start + windowMs - now()) / 1000);
      res.set('retry-after', String(retry));
      next(new AppError(429, 'RATE_LIMITED', 'অনেক অনুরোধ; কিছুক্ষণ পরে চেষ্টা করুন'));
      return;
    }
    next();
  };
}
