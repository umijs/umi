import errorMap from 'umi-error-map';
import chalk from 'chalk';

export class UmiError extends Error {
  constructor(opts, ...params) {
    const { message, tip, code, context } = opts;
    super(message, ...params);
    this.code = code;
    this.tip = tip;
    this.context = context || {};
  }
}

export function printUmiError(e, opts = {}) {
  if (!(e instanceof UmiError)) {
    throw new Error('Invalid error type, UmiError instance needed.');
  }

  const { tipsOnly } = opts;
  const { context } = e;
  let { code } = e;

  if (!e.code) {
    for (const c of Object.keys(errorMap)) {
      const { test } = errorMap[c];
      if (test({ error: e, context })) {
        code = c;
      }
    }
  }

  const { message, tip, tip_zh_CN } = errorMap[code];
  console.error(`\n${chalk.bgRed.black(' ERROR CODE ')} ${chalk.red(code)}`);

  if (!tipsOnly) {
    console.error(`\n${chalk.bgRed.black(' ERROR ')} ${chalk.red(e.message || message)}`);
  }

  if (process.env.LANG.includes('zh_CN')) {
    console.error(`\n${chalk.bgMagenta.black(' TIPS ')}\n\n${tip_zh_CN}`);
  } else {
    console.error(`\n${chalk.bgMagenta.black(' TIPS ')}\n\n${tip}`);
  }

  if (!tipsOnly && e.stack) {
    console.error(
      `\n${chalk.bgRed.black(' STACK ')}\n${e.stack
        .split('\n')
        .slice(1)
        .join('\n')}`,
    );
  }
}
