// শুধু নকশা দেখানোর জন্য; চালানো হয়নি। এই বইয়ের QA-যন্ত্রে socket.io নেই,
// এবং কোনো Package Install করা হয়নি। চালাতে: npm install socket.io
// (session-auth.mjs আপনার নিজের Session ও অনুমতি-যাচাইয়ের Module।)
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { authenticateSession, canViewBooking } from './session-auth.mjs';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: ['https://app.example.com'] },
  maxHttpBufferSize: 4 * 1024,
});

// Middleware: Connection-এর আগেই Session যাচাই।
io.use(async (socket, next) => {
  try {
    socket.data.user = await authenticateSession(socket.request);
    next();
  } catch {
    next(new Error('UNAUTHORIZED'));
  }
});

io.on('connection', (socket) => {
  // Acknowledgement: Client-এর কাছে ফলাফল ফেরত (ack Callback)।
  socket.on('booking:subscribe', async ({ bookingId } = {}, ack) => {
    if (typeof bookingId !== 'string') return ack?.({ ok: false });
    if (!await canViewBooking(socket.data.user.id, bookingId)) {
      return ack?.({ ok: false, code: 'FORBIDDEN' });
    }
    await socket.join(`booking:${bookingId}`);
    return ack?.({ ok: true });
  });
});

// Room-এ পাঠানো: ওই Room-এর সব Socket পায়, যে Instance-এই থাকুক
// (একাধিক Instance-এ Redis Adapter লাগবে)।
export function publish(event) {
  io.to(`booking:${event.bookingId}`).emit('booking:event', event);
}

httpServer.listen(3000);
