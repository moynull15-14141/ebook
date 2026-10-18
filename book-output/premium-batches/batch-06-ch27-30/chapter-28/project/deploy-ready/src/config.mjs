// Twelve-Factor: সব Configuration Environment থেকে; শুরুতেই যাচাই।
// ভুল থাকলে সব ভুল একসঙ্গে জানিয়ে Process চালুই হবে না (Fail Fast)।
const LEVELS = ['debug', 'info', 'warn', 'error'];

function integer(env, name, fallback, min, max, errors) {
  const raw = env[name] ?? String(fallback);
  const value = Number(raw);
  if (!/^\d+$/.test(raw) || value < min || value > max) {
    errors.push(`${name} হতে হবে ${min} থেকে ${max}-এর পূর্ণসংখ্যা`);
  }
  return value;
}

export function loadConfig(env = process.env) {
  const errors = [];
  const nodeEnv = env.NODE_ENV ?? 'development';
  const config = {
    nodeEnv,
    port: integer(env, 'PORT', 3000, 0, 65535, errors),
    logLevel: env.LOG_LEVEL ?? 'info',
    shutdownTimeoutMs: integer(env, 'SHUTDOWN_TIMEOUT_MS', 10_000,
      1, 120_000, errors),
    drainDelayMs: integer(env, 'DRAIN_DELAY_MS', 0, 0, 60_000, errors),
    version: env.APP_VERSION ?? '0.0.0-dev',
    commit: env.GIT_SHA ?? 'unknown',
    opsToken: env.OPS_TOKEN,
  };
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    errors.push('NODE_ENV হতে হবে development, test বা production');
  }
  if (!LEVELS.includes(config.logLevel)) {
    errors.push(`LOG_LEVEL হতে হবে ${LEVELS.join(', ')}`);
  }
  if (nodeEnv === 'production' && (config.opsToken ?? '').length < 24) {
    errors.push('Production-এ OPS_TOKEN কমপক্ষে ২৪ অক্ষরের হতে হবে');
  }
  if (errors.length) {
    throw new Error(`Configuration ভুল:\n- ${errors.join('\n- ')}`);
  }
  return Object.freeze(config);
}

// Log বা Error-এ Config দেখাতে হলে গোপন মান লুকিয়ে।
export function describeConfig(config) {
  return { ...config, opsToken: config.opsToken ? '[REDACTED]' : undefined };
}
