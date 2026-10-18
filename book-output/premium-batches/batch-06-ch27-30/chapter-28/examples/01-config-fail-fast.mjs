import { loadConfig, describeConfig }
  from '../project/deploy-ready/src/config.mjs';

const environments = {
  'Local, কিছুই দেওয়া নেই': {},
  'ভুল টাইপ': { PORT: 'abc', LOG_LEVEL: 'verbose' },
  'Production, Token নেই': { NODE_ENV: 'production', PORT: '8080' },
  'Production, ঠিকঠাক': { NODE_ENV: 'production', PORT: '8080',
    OPS_TOKEN: 'k'.repeat(32), GIT_SHA: '9f2c1ab' },
};

for (const [name, env] of Object.entries(environments)) {
  try {
    const config = describeConfig(loadConfig(env));
    console.log(`${name}: চালু`, { port: config.port,
      env: config.nodeEnv, token: config.opsToken });
  } catch (error) {
    console.log(`${name}: থামল\n  ${error.message.replace(/\n/g, '\n  ')}`);
  }
}
