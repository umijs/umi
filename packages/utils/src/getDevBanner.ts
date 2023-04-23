import address from '../compiled/address';
import chalk from '../compiled/chalk';
import stripAnsi from '../compiled/strip-ansi';

const BORDERS = {
  TL: chalk.gray.dim('╔'),
  TR: chalk.gray.dim('╗'),
  BL: chalk.gray.dim('╚'),
  BR: chalk.gray.dim('╝'),
  V: chalk.gray.dim('║'),
  H_PURE: '═',
};

export function getDevBanner(
  protocol: string,
  host = '0.0.0.0',
  port: number,
  offset = 8,
) {
  // prepare all source lines
  const header = ' App listening at:';
  const footer = chalk.bold(
    ' Now you can open browser with the above addresses↑ ',
  );
  const local = `  ${chalk.gray('>')}   Local: ${chalk.green(
    `${protocol}//${host === '0.0.0.0' ? 'localhost' : host}:${port}`,
  )} `;
  const ip = address.ip();
  const network = `  ${chalk.gray('>')} Network: ${
    ip ? chalk.green(`${protocol}//${ip}:${port}`) : chalk.gray('Not available')
  } `;
  const maxLen = Math.max(
    ...[header, footer, local, network].map((x) => stripAnsi(x).length),
  );

  // prepare all output lines
  const beforeLines = [
    `${BORDERS.TL}${chalk.gray.dim(''.padStart(maxLen, BORDERS.H_PURE))}${
      BORDERS.TR
    }`,
    `${BORDERS.V}${header}${''.padStart(maxLen - header.length)}${BORDERS.V}`,
    `${BORDERS.V}${local}${''.padStart(maxLen - stripAnsi(local).length)}${
      BORDERS.V
    }`,
  ];
  const mainLine = `${BORDERS.V}${network}${''.padStart(
    maxLen - stripAnsi(network).length,
  )}${BORDERS.V}`;
  const afterLines = [
    `${BORDERS.V}${''.padStart(maxLen)}${BORDERS.V}`,
    `${BORDERS.V}${footer}${''.padStart(maxLen - stripAnsi(footer).length)}${
      BORDERS.V
    }`,
    `${BORDERS.BL}${chalk.gray.dim(''.padStart(maxLen, BORDERS.H_PURE))}${
      BORDERS.BR
    }`,
  ];

  // join lines as 3 parts for vertical middle output with logger
  return {
    before: beforeLines.map((l) => l.padStart(l.length + offset)).join('\n'),
    main: mainLine,
    after: afterLines.map((l) => l.padStart(l.length + offset)).join('\n'),
  };
}
