import express from 'express';
import {
  requestId, requestLogger, authenticate, rateLimit,
} from './middleware.mjs';
import { notFoundHandler, errorHandler } from './error-handler.mjs';
import { leadRoutes } from './routes.mjs';

// Middleware-এর ক্রমই নিরাপত্তা: ID ও Log সবার আগে, তারপর Body-র সীমা,
// তারপর Health (Token ছাড়া), তারপর Authentication, সীমা, Route, শেষে Error।
export function createApp(deps) {
  const { config, service, log = () => {}, state = { ready: true } } = deps;
  const app = express();
  app.disable('x-powered-by');
  app.use(requestId);
  app.use(requestLogger(log));
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/ready', (req, res) => {
    res.status(state.ready ? 200 : 503).json({ ready: state.ready });
  });

  app.use('/v1', authenticate(config.users), rateLimit(config.rateLimit));
  app.use('/v1/leads', leadRoutes(service));

  app.use(notFoundHandler);
  app.use(errorHandler(log));
  return app;
}
