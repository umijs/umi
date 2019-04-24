import chalk from 'chalk';

export default function error(msg: string, name?: string) {
  const err = new Error(chalk.red(msg));
  err.name = name || 'AutoExternalError';
  throw err;
}
