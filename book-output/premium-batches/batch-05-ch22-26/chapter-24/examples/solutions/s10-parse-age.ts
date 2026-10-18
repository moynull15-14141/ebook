type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const fail = <E>(error: E): Result<never, E> => ({ ok: false, error });

function parseAge(input: unknown): Result<number, string> {
  const value = typeof input === 'string' ? Number(input.trim()) : input;
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return fail('বয়স পূর্ণসংখ্যা হতে হবে');
  }
  return value >= 0 && value <= 120 ? ok(value) : fail('বয়স ০ থেকে ১২০');
}

for (const input of ['34', 34.5, 200, null]) {
  const result = parseAge(input);
  console.log(result.ok ? `বৈধ: ${result.value}` : `ভুল: ${result.error}`);
}
