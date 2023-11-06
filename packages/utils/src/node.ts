import { isLocalDev, logger } from './';

const ver = parseInt(process.version.slice(1));

export function checkVersion(minVersion: number, message?: string) {
  if (ver < minVersion || ver === 15 || ver === 17 || ver === 19) {
    logger.error(
      message ||
        `Your node version ${ver} is not supported, please upgrade to ${minVersion} or above except 15 or 17.`,
    );
    process.exit(1);
  }
}

export function checkLocal() {
  if (isLocalDev()) {
    logger.info('@local');
  }
}

export function setNodeTitle(name: string) {
  if (process.title === 'node') {
    process.title = name;
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
