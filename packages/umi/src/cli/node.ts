import { isLocalDev, logger, semver } from '@umijs/utils';
import { FRAMEWORK_NAME, MIN_NODE_VERSION } from '../constants';

const ver = semver.major(process.version);

export function checkVersion() {
  if (ver < MIN_NODE_VERSION || ver === 15 || ver === 17) {
    logger.error(
      `Your node version ${ver} is not supported, please upgrade to ${MIN_NODE_VERSION} or above except 15 or 17.`,
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

export function catchUnhandledRejection() {
  // catch unhandledRejection for Node.js 14
  // because --unhandled-rejections=throw enabled since Node.js 15
  // ref: http://nodejs.cn/api/cli/unhandled_rejections_mode.html
  if (ver <= 14) {
    process.on('unhandledRejection', (err) => {
      throw err;
    });
  }
}
