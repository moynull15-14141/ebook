function requireSecret(name, env) {
  const value = env[name];
  if (typeof value !== 'string' || value.length < 32) {
    throw new Error(`${name} সেট করা নেই বা ৩২ অক্ষরের কম`);
  }
  return value;
}

try {
  requireSecret('SESSION_SECRET', {});
} catch (error) {
  console.log(error.message);
}
const env = { SESSION_SECRET: 'k'.repeat(48) };
console.log(requireSecret('SESSION_SECRET', env).length);
