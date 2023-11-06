import { dirname, join } from 'path';
import chalk from '../compiled/chalk';
import fsExtra from '../compiled/fs-extra';
import { pkgUpSync } from '../compiled/pkg-up';
import { importLazy } from './importLazy';

const enableFSLogger =
  process.env.FS_LOGGER !== 'none' && !process.versions.webcontainer;

const profilers: Record<string, { startTime: number }> = {};

const loggerDir = findLoggerDir();
const loggerPath = join(loggerDir, 'umi.log');

export const prefixes = {
  wait: chalk.cyan('wait') + '  -',
  error: chalk.red('error') + ' -',
  fatal: chalk.red('fatal') + ' -',
  warn: chalk.yellow('warn') + '  -',
  ready: chalk.green('ready') + ' -',
  info: chalk.cyan('info') + '  -',
  event: chalk.magenta('event') + ' -',
  debug: chalk.gray('debug') + ' -',
  profile: chalk.blue('profile') + ' -',
};

const pinoModule: typeof import('pino') = importLazy(require.resolve('pino'));

let logger: any;
if (enableFSLogger) {
  const pino = pinoModule.default;
  fsExtra.mkdirpSync(loggerDir);
  const customLevels = {
    ready: 31,
    event: 32,
    wait: 55,
    // 虽然这里设置了 debug 为 30，但日志中还是 20，符合预期
    // 这里不加会不生成到 umi.log，transport 的 level 配置没有生效，原因不明
    debug: 30,
  };
  logger = pino(
    {
      customLevels,
    },
    pino.transport({
      targets: [
        {
          target: require.resolve('pino/file'),
          options: {
            destination: loggerPath,
          },
          level: 'trace',
        },
      ],
    }),
  );
} else {
  logger = {};
  Object.keys(prefixes).forEach((key) => {
    logger[key] = () => {};
  });
}

export function wait(...message: any[]) {
  console.log(prefixes.wait, ...message);
  logger.wait(message[0]);
}

export function error(...message: any[]) {
  console.error(prefixes.error, ...message);
  logger.error(message[0]);
}

export function warn(...message: any[]) {
  console.warn(prefixes.warn, ...message);
  logger.warn(message[0]);
}

export function ready(...message: any[]) {
  console.log(prefixes.ready, ...message);
  logger.ready(message[0]);
}

export function info(...message: any[]) {
  console.log(prefixes.info, ...message);
  logger.info(message[0]);
}

export function event(...message: any[]) {
  console.log(prefixes.event, ...message);
  logger.event(message[0]);
}

export function debug(...message: any[]) {
  if (process.env.DEBUG) {
    console.log(prefixes.debug, ...message);
  }
  logger.debug(message[0]);
}

export function fatal(...message: any[]) {
  console.error(prefixes.fatal, ...message);
  logger.fatal(message[0]);
}

export function profile(id: string, ...message: any[]) {
  // Worker logs only available in debug mode
  if (process.env.IS_UMI_BUILD_WORKER && !process.env.DEBUG) {
    return;
  }
  if (!profilers[id]) {
    profilers[id] = {
      startTime: Date.now(),
    };
    console.log(prefixes.profile, chalk.green(id), ...message);
    return;
  }
  const endTime = Date.now();
  const { startTime } = profilers[id];
  console.log(
    prefixes.profile,
    chalk.green(id),
    `Completed in ${chalk.cyan(`${endTime - startTime}ms`)}`,
    ...message,
  );
  delete profilers[id];
}

export function getLatestLogFilePath() {
  return enableFSLogger ? loggerPath : null;
}

function findLoggerDir() {
  let baseDir = process.cwd();
  const pkg = pkgUpSync({ cwd: baseDir });
  if (pkg) {
    baseDir = dirname(pkg);
  }
  return join(baseDir, 'node_modules/.cache/logger');
}
