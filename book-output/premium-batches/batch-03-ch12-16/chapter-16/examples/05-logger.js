function createLogger(context, write = console.log) {
  return (level, event, data = {}) =>
    write(JSON.stringify({ level, event, ...context, ...data }));
}

const log = createLogger({ service: 'booking' });

log('info', 'created', { id: 'B-1', seats: 2 });
log('warn', 'payment-retry', { attempt: 1 });
