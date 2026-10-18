import { createDemo } from './src/demo-data.mjs';
import { createLiveServer } from './src/server.mjs';

const port = Number(process.env.PORT ?? 3027);
const origin = `http://localhost:${port}`;
const { hub, users } = createDemo();
const { server } = createLiveServer({ hub, users,
  allowedOrigins: [origin, `http://127.0.0.1:${port}`] });

server.listen(port, () => console.log(`TravelLive: ${origin}`));

// SIGTERM/Ctrl+C: নতুন Connection বন্ধ, পুরোনোগুলো শেষ করে বের হওয়া।
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    server.closeAllConnections();
  });
}
