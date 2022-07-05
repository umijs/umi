import { join } from 'path';
import pino, { type Logger } from 'pino';
import chalk from '../compiled/chalk';
import fsExtra from '../compiled/fs-extra';

const loggerDir = join(process.cwd(), 'node_modules/.cache/logger');
const loggerPath = join(loggerDir, 'umi.log');


const customLevels = {
  ready: 31,
  event: 32,
  wait: 55,
  // 虽然这里设置了 debug 为 30，但日志中还是 20，符合预期
  // 这里不加会不生成到 umi.log，transport 的 level 配置没有生效，原因不明
  debug: 30,
};

let logger: Logger<{ customLevels: typeof customLevels }>;
function init() {
  // 不存在目录就创建它
  if (!logger) {
   fsExtra.mkdirpSync(loggerDir);
     logger= pino(
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
  }

}

const prefixesBase = {
  wait: chalk.cyan('wait') + '  -',
  error: chalk.red('error') + ' -',
  fatal: chalk.red('fatal') + ' -',
  warn: chalk.yellow('warn') + '  -',
  ready: chalk.green('ready') + ' -',
  info: chalk.cyan('info') + '  -',
  event: chalk.magenta('event') + ' -',
  debug: chalk.gray('debug') + ' -',
};

const prefixes = new Proxy(prefixesBase, {
  get(target, key, receiver) {
    init();
    return Reflect.get(target, key, receiver);
  },
});

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

export function getLatestLogFilePath() {
  return loggerPath;
}
