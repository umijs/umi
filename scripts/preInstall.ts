import * as logger from '@umijs/utils/src/logger';

if (!/pnpm/.test(process.env.npm_execpath || '')) {
  logger.error(`This repository requires using pnpm to work properly.`);
  process.exit(1);
}
