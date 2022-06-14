import { isLocalDev, logger } from '@umijs/utils';
import { FRAMEWORK_NAME, MIN_NODE_VERSION } from '../constants';

export function checkVersion() {
  const v = parseInt(process.version.slice(1));
  if (v < MIN_NODE_VERSION || v === 15 || v === 17) {
    logger.error(
      `Your node version ${v} is not supported, please upgrade to ${MIN_NODE_VERSION} or above except 15 or 17.`,
    );
    process.exit(1);
  }
}

export function checkLocal() {
  if (isLocalDev()) {
    logger.info('@local');
  }
}

export function setNodeTitle(name?: string) {
  if (process.title === 'node') {
    process.title = name || FRAMEWORK_NAME;
  }
}

export function setNoDeprecation() {
  // Use magic to suppress node deprecation warnings
  // See: https://github.com/nodejs/node/blob/master/lib/internal/process/warning.js#L77
  // @ts-ignore
  process.noDeprecation = '1';
}
