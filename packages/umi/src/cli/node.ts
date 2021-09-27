import { logger } from '@umijs/utils';
import { FRAMEWORK_NAME, MIN_NODE_VERSION } from '../constants';

export function checkVersion() {
  const v = parseInt(process.version.slice(1));
  if (v < MIN_NODE_VERSION) {
    logger.error(
      `Your node ${v} is not supported by umi, please upgrade to ${MIN_NODE_VERSION} or above.`,
    );
    process.exit(1);
  }
}

export function checkLocal() {
  if (__filename.includes('packages/umi')) {
    logger.info('@local');
  }
}

export function setNodeTitle(name?: string) {
  if (process.title === 'node') {
    process.title = name || FRAMEWORK_NAME;
  }
}
