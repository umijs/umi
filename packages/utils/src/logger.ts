import chalk from '../compiled/chalk';

export const prefixes = {
  wait: chalk.cyan('wait') + '  -',
  error: chalk.red('error') + ' -',
  warn: chalk.yellow('warn') + '  -',
  ready: chalk.green('ready') + ' -',
  info: chalk.cyan('info') + '  -',
  event: chalk.magenta('event') + ' -',
  debug: chalk.gray('debug') + ' -',
};

export function wait(...message: any[]) {
  console.log(prefixes.wait, ...message);
}

export function error(...message: any[]) {
  console.error(prefixes.error, ...message);
}

export function warn(...message: any[]) {
  console.warn(prefixes.warn, ...message);
}

export function ready(...message: any[]) {
  console.log(prefixes.ready, ...message);
}

export function info(...message: any[]) {
  console.log(prefixes.info, ...message);
}

export function event(...message: any[]) {
  console.log(prefixes.event, ...message);
}

export function debug(...message: any[]) {
  if (process.env.DEBUG) {
    console.log(prefixes.debug, ...message);
  }
}
