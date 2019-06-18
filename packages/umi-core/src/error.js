import chalk from 'chalk';
import signale from 'signale';
import marked from 'marked';
import TerminalRenderer from 'marked-terminal';

marked.setOptions({
  renderer: new TerminalRenderer(),
});

export class UmiError extends Error {
  constructor(opts, ...params) {
    const { message, code, context } = opts;
    super(message, ...params);
    this.code = code;
    this.context = context || {};
  }
}

export function printUmiError(e, opts = {}) {
  if (!(e instanceof UmiError)) {
    signale.error(e);
    return;
  }

  const { detailsOnly } = opts;
  const { context } = e;
  let { code } = e;
  // 支持内部框架扩展 error code map
  const errorCodeMap = require(process.env.ERROR_CODE_MAP_PATH || '@umijs/error-code-map');

  if (!code) {
    for (const c of Object.keys(errorCodeMap)) {
      const { test } = errorCodeMap[c];
      if (test && test({ error: e, context })) {
        code = c;
      }
    }
  }

  if (!code) return;

  const { message, details } = errorCodeMap[code];
  console.error(`\n${chalk.bgRed.black(' ERROR CODE ')} ${chalk.red(code)}`);

  if (!detailsOnly) {
    console.error(`\n${chalk.bgRed.black(' ERROR ')} ${chalk.red(e.message || message)}`);
  }

  if (process.env.LANG.includes('zh_CN')) {
    console.error(`\n${chalk.bgMagenta.black(' DETAILS ')}\n\n${marked(details['zh-CN'])}`);
  } else {
    console.error(`\n${chalk.bgMagenta.black(' DETAILS ')}\n\n${marked(details.en)}`);
  }

  if (!detailsOnly && e.stack) {
    console.error(
      `${chalk.bgRed.black(' STACK ')}\n\n${e.stack
        .split('\n')
        .slice(1)
        .join('\n')}`,
    );
  }
}
