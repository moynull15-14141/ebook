import { createLogger } from '../project/deploy-ready/src/logger.mjs';

// স্থির সময়, যাতে আউটপুট প্রতিবার এক।
let tick = 0;
const now = () => new Date(Date.UTC(2026, 9, 18, 10, 0, tick++));
// আসলে প্রতিটি Log একটি JSON Line; এখানে পড়ার সুবিধায় Object আকারে ছাপা।
const write = (line) => console.log(JSON.parse(line));
const logger = createLogger({ level: 'info', now, write,
  base: { service: 'deploy-ready' } });

const request = logger.child({ requestId: 'req-7f3a' });
request.debug('cache.miss', { key: 'jobs' }); // level info: লেখা হবে না
request.info('job.created', { jobId: 42, priority: 'high' });
request.warn('auth.failed', { authorization: 'Bearer s3cr3t', ip: '10.0.0.8' });
logger.error('db.timeout', { query: 'list-jobs', durationMs: 5003 });
