// একটি আলাদা Thread, নিজস্ব Database সংযোগ: একই File-এ একসঙ্গে Booking।
import { workerData, parentPort } from 'node:worker_threads';
import { openDatabase } from '../../src/db.mjs';
import { createTravelService } from '../../src/service.mjs';

const { dbPath, index, attempts, password } = workerData;
const db = openDatabase(dbPath);
const service = createTravelService({ db });
const email = `worker${index}@example.com`;
service.register({ name: `Worker ${index}`, email, password });
const { user } = service.login({ email, password });

const result = { booked: 0, soldOut: 0 };
for (let i = 0; i < attempts; i += 1) {
  try {
    service.createBooking(user.id, { packageId: 'CXB-3D', travelers: 1,
      idempotencyKey: `w${index}-attempt-${i}` });
    result.booked += 1;
  } catch (error) {
    if (error.code !== 'SOLD_OUT') throw error;
    result.soldOut += 1;
  }
}
db.close();
parentPort.postMessage(result);
