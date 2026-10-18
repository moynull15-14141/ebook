import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE places (name TEXT);
  INSERT INTO places VALUES ('Sylhet'), ('Cox''s Bazar'), ('100% Sundarbans');`);

const escapeLike = (text) => text.replace(/[\\%_]/g, (ch) => `\\${ch}`);
const search = db.prepare(
  "SELECT name FROM places WHERE name LIKE ? ESCAPE '\\'");

for (const input of ['ba', '%', "'"]) {
  const rows = search.all(`%${escapeLike(input)}%`);
  console.log(JSON.stringify(input), rows.map((row) => row.name).join(', '));
}
