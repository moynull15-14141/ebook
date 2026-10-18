import { priceFor, validateRequest } from './booking-core.mjs';
import { AppError, PaymentError } from './errors.mjs';

const realSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createBookingService({
  repository,
  payment,
  notifier,
  clock = () => new Date(),
  sleep = realSleep,
  log = () => {},
  retries = 2,
}) {
  async function chargeWithRetry(request, amount, requestId) {
    for (let attempt = 0; ; attempt += 1) {
      try {
        const order = { amount, email: request.email, key: requestId };
        return await payment.charge(order);
      } catch (error) {
        const retryable = error instanceof PaymentError && error.retryable;
        if (!retryable || attempt >= retries) {
          throw error;
        }
        log('warn', 'payment-retry', { requestId, attempt: attempt + 1 });
        await sleep(100 * 2 ** attempt);
      }
    }
  }

  async function notify(booking) {
    try {
      await notifier.send(booking.email, `Booking ${booking.id} নিশ্চিত`);
    } catch (error) {
      log('warn', 'notify-failed', { id: booking.id, reason: error.message });
    }
  }

  async function book(raw, requestId) {
    const existing = await repository.find(requestId);
    if (existing) {
      return existing;
    }

    const request = validateRequest(raw);
    const amount = priceFor(request.seats);
    await repository.reserve(request.seats);

    let receipt;
    try {
      receipt = await chargeWithRetry(request, amount, requestId);
    } catch (error) {
      await repository.release(request.seats);
      const code = error.code ?? 'UNKNOWN';
      log('error', 'payment-failed', { requestId, code });
      throw error;
    }

    const booking = {
      id: requestId, ...request, amount, receipt,
      status: 'confirmed', createdAt: clock().toISOString(),
    };
    await repository.save(booking);
    const { seats } = request;
    log('info', 'booking-confirmed', { id: requestId, seats, amount });
    await notify(booking);
    return booking;
  }

  async function cancel(id) {
    const booking = await repository.find(id);
    if (!booking) {
      throw new AppError(`${id} পাওয়া যায়নি।`, { code: 'NOT_FOUND' });
    }
    if (booking.status === 'cancelled') {
      throw new AppError(`${id} আগেই বাতিল।`, { code: 'ALREADY_CANCELLED' });
    }
    await payment.refund(booking.receipt);
    await repository.release(booking.seats);
    const cancelled = { ...booking, status: 'cancelled' };
    await repository.save(cancelled);
    log('info', 'booking-cancelled', { id });
    return cancelled;
  }

  return { book, cancel };
}
