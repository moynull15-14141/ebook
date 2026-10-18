import { serveJson } from './http-util.mjs';

// Inventory Service: আসনের মালিক। প্রতিটি কাজ reservationId দিয়ে Idempotent,
// তাই Orchestrator নিশ্চিন্তে Retry বা Crash-এর পরে আবার ডাকতে পারে।
export async function startInventory({ seats }) {
  const state = { available: seats, reservations: new Map() };
  const faults = { failNext: 0 };

  function route(method, [resource, id], body) {
    if (method === 'GET' && resource === 'stock') {
      const active = [...state.reservations.values()].filter((r) => r.active);
      return [200, { available: state.available,
        reserved: active.reduce((sum, r) => sum + r.seats, 0) }];
    }
    if (method === 'POST' && resource === 'reservations') {
      if (faults.failNext > 0) {
        faults.failNext -= 1;
        return [503, { error: 'UNAVAILABLE' }];
      }
      const existing = state.reservations.get(body.reservationId);
      if (existing) return [200, { ...existing, replay: true }];
      if (!Number.isInteger(body.seats) || body.seats < 1) {
        return [400, { error: 'INVALID_SEATS' }];
      }
      if (state.available < body.seats) return [409, { error: 'SOLD_OUT' }];
      state.available -= body.seats;
      const reservation = { reservationId: body.reservationId,
        seats: body.seats, active: true };
      state.reservations.set(body.reservationId, reservation);
      return [201, { ...reservation }];
    }
    if (method === 'DELETE' && resource === 'reservations') {
      const reservation = state.reservations.get(id);
      if (!reservation?.active) return [200, { released: false }];
      reservation.active = false;
      state.available += reservation.seats;
      return [200, { released: true }];
    }
    return [404, { error: 'NOT_FOUND' }];
  }

  const server = await serveJson(route);
  return { ...server, state, faults };
}
