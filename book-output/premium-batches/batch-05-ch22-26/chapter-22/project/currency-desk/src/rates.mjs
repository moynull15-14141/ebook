export class RateError extends Error {
  constructor(code, message, { retryable = false, cause } = {}) {
    super(message, { cause });
    this.name = 'RateError';
    this.code = code;
    this.retryable = retryable;
  }
}

const CURRENCY = /^[A-Z]{3}$/;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// সব বাইরের নির্ভরতা Inject করা: fetch, ঘড়ি, অপেক্ষা। Test-এ সবই বদলানো যায়।
export function createRateClient(options) {
  const { baseUrl, fetchFn = fetch, now = Date.now, sleep = wait } = options;
  const { ttlMs = 60_000, retries = 2 } = options;
  const cache = new Map();

  async function fetchOnce(pair) {
    let response;
    try {
      response = await fetchFn(`${baseUrl}/rates/${pair}`);
    } catch (error) {
      throw new RateError('NETWORK', 'Rate Server-এ পৌঁছানো যায়নি',
        { retryable: true, cause: error });
    }
    if (response.status === 404) {
      throw new RateError('UNKNOWN_PAIR', `${pair}-এর হার নেই`);
    }
    if (!response.ok) {
      throw new RateError('UPSTREAM', `Rate Server: ${response.status}`,
        { retryable: response.status >= 500 });
    }
    const { rateMicro } = await response.json();
    if (!Number.isSafeInteger(rateMicro) || rateMicro <= 0) {
      throw new RateError('BAD_DATA', 'Rate Server অবৈধ হার পাঠিয়েছে');
    }
    return rateMicro;
  }

  async function getRate(from, to) {
    if (!CURRENCY.test(from) || !CURRENCY.test(to) || from === to) {
      throw new RateError('BAD_CURRENCY', 'মুদ্রা তিন অক্ষরের, এবং দুটি ভিন্ন');
    }
    const pair = `${from}-${to}`;
    const hit = cache.get(pair);
    if (hit && now() - hit.at < ttlMs) {
      return hit.rateMicro;
    }
    for (let attempt = 0; ; attempt += 1) {
      try {
        const rateMicro = await fetchOnce(pair);
        cache.set(pair, { rateMicro, at: now() });
        return rateMicro;
      } catch (error) {
        if (!error.retryable || attempt >= retries) {
          throw error;
        }
        await sleep(100 * 2 ** attempt);
      }
    }
  }

  return { getRate };
}
