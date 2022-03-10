import { logger } from '@umijs/utils';
import process from 'process';

export function printMemoryUsage() {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  const rss = process.memoryUsage().rss / 1024 / 1024;
  logger.info(
    `Memory Usage: ${Math.round(used * 100) / 100} MB (RSS: ${
      Math.round(rss * 100) / 100
    } MB)`,
  );
}
