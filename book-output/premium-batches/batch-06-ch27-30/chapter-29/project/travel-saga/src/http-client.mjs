// Service-এর মধ্যে HTTP ডাক: Timeout, সীমিত Retry (Backoff + Jitter)
// এবং Circuit Breaker। 4xx-এ Retry নয়: সেটি ব্যবসার উত্তর, সাময়িক সমস্যা নয়।
import { setTimeout as delay } from 'node:timers/promises';

export class HttpError extends Error {
  constructor(status, body) {
    super(`HTTP ${status}${body?.error ? ` ${body.error}` : ''}`);
    this.status = status;
    this.body = body;
    this.retryable = status >= 500 || status === 429;
  }
}

export class CircuitOpenError extends Error {
  constructor() {
    super('Circuit open: Dependency-কে বিশ্রাম দেওয়া হচ্ছে');
    this.code = 'CIRCUIT_OPEN';
  }
}

export function createBreaker({ failureThreshold = 3, resetMs = 1000,
  now = Date.now } = {}) {
  let state = 'closed';
  let failures = 0;
  let openedAt = 0;
  return {
    get state() {
      if (state === 'open' && now() - openedAt >= resetMs) state = 'half-open';
      return state;
    },
    before() {
      if (this.state === 'open') throw new CircuitOpenError();
    },
    success() {
      state = 'closed';
      failures = 0;
    },
    failure() {
      failures += 1;
      if (state === 'half-open' || failures >= failureThreshold) {
        state = 'open';
        openedAt = now();
      }
    },
  };
}

export const backoffMs = (attempt, random = Math.random, base = 50) =>
  Math.floor(random() * base * 2 ** attempt); // Full Jitter

export async function callJson(url, { method = 'GET', body, timeoutMs = 500,
  retries = 2, breaker, random = Math.random } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    breaker?.before();
    try {
      const res = await fetch(url, { method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(timeoutMs) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        breaker?.success();
        return { status: res.status, ...data };
      }
      throw new HttpError(res.status, data);
    } catch (error) {
      if (error instanceof HttpError && !error.retryable) {
        breaker?.success(); // Service সুস্থ, শুধু উত্তর "না"
        throw error;
      }
      breaker?.failure();
      if (attempt >= retries) throw error;
      await delay(backoffMs(attempt, random));
    }
  }
}
