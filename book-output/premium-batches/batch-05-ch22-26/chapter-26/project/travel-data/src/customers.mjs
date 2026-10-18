import { withTransaction } from './db.mjs';
import { translate } from './errors.mjs';

const MESSAGES = {
  'customers.email': 'এই Email-এ আগেই একজন গ্রাহক আছেন',
  'customers.phone': 'এই ফোন নম্বরে আগেই একজন গ্রাহক আছেন',
  name_length: 'নাম ২ থেকে ৮০ অক্ষর',
  phone_format: '১১ অঙ্কের মোবাইল নম্বর',
};

// সব Query Parameterized; LIKE-এর বিশেষ চিহ্ন (% ও _) Escape করা।
const escapeLike = (text) => text.replace(/[\\%_]/g, (ch) => `\\${ch}`);

export function createCustomerStore(db) {
  const sql = {
    insert: db.prepare(
      'INSERT INTO customers (name, email, phone, city) VALUES (?, ?, ?, ?)'),
    account: db.prepare('INSERT INTO accounts (customer_id) VALUES (?)'),
    byEmail: db.prepare('SELECT * FROM customers WHERE email = ?'),
    page: db.prepare(`SELECT id, name FROM customers
      WHERE city = ? AND id > ? ORDER BY id LIMIT ?`),
    search: db.prepare(`SELECT id, name FROM customers
      WHERE name LIKE ? ESCAPE '\\' ORDER BY name, id LIMIT 20`),
  };

  // গ্রাহক ও তাঁর Account একসঙ্গে: একটি ব্যর্থ হলে দুটিই বাতিল।
  function create({ name, email, phone, city }) {
    try {
      return withTransaction(db, () => {
        const { lastInsertRowid } = sql.insert.run(name, email, phone, city);
        sql.account.run(lastInsertRowid);
        return Number(lastInsertRowid);
      });
    } catch (error) {
      throw translate(error, MESSAGES);
    }
  }

  // Keyset Pagination: "এই id-র পর থেকে", Index দিয়ে সরাসরি।
  const byCity = (city, { after = 0, limit = 20 } = {}) =>
    sql.page.all(city, after, limit).map((row) => ({ ...row }));

  const search = (text) =>
    sql.search.all(`%${escapeLike(text)}%`).map((row) => ({ ...row }));

  const findByEmail = (email) => {
    const row = sql.byEmail.get(email);
    return row ? { ...row } : null;
  };

  return { create, byCity, search, findByEmail };
}
