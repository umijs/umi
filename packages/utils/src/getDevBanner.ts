import address from '../compiled/address';
import chalk from '../compiled/chalk';
import stripAnsi from '../compiled/strip-ansi';
import * as logger from './logger';
import { openBrowser } from './openBrowser';
import readline from 'readline';

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
  const localUrl = `${protocol}//${
    host === '0.0.0.0' ? 'localhost' : host
  }:${port}`;
  const local = `  ${chalk.gray('>')}   Local: ${chalk.green(localUrl)} `;
  const network = `  ${chalk.gray('>')} Network: ${chalk.green(
    `${protocol}//${address.ip()}:${port}`,
  )} `;

  const isOpenShortcuts = process.env.UMI_SHORTCUTS !== 'none';
  const shortcutsHelper = chalk.gray(
    ` Press ${chalk.cyan.bold('h')} to show shortcuts help`,
  );
  if (isOpenShortcuts) {
    initShortcuts({ localUrl });
  }

  const maxLen = Math.max(
    ...[header, footer, local, network, isOpenShortcuts && shortcutsHelper]
      .filter(Boolean)
      .map((x) => stripAnsi(x as string).length),
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
    isOpenShortcuts &&
      `${BORDERS.V}${shortcutsHelper}${''.padStart(
        maxLen - stripAnsi(shortcutsHelper).length,
      )}${BORDERS.V}`,
    `${BORDERS.V}${footer}${''.padStart(maxLen - stripAnsi(footer).length)}${
      BORDERS.V
    }`,
    `${BORDERS.BL}${chalk.gray.dim(''.padStart(maxLen, BORDERS.H_PURE))}${
      BORDERS.BR
    }`,
  ].filter(Boolean) as string[];

  // join lines as 3 parts for vertical middle output with logger
  return {
    before: beforeLines.map((l) => l.padStart(l.length + offset)).join('\n'),
    main: mainLine,
    after: afterLines.map((l) => l.padStart(l.length + offset)).join('\n'),
  };
}

interface IInitShortCutsOpts {
  localUrl: string;
}

interface IShortCut {
  key: string;
  description: string;
  action: () => void | Promise<void>;
}

enum EKey {
  h = 'h',
  r = 'r',
  o = 'o',
  q = 'q',
}

function initShortcuts(opts: IInitShortCutsOpts) {
  const { localUrl } = opts;

  const shortcuts: IShortCut[] = [
    {
      key: EKey.r,
      description: 'restart the server',
      action() {
        process.emit('UMI_RESTART_SERVER' as any);
      },
    },
    {
      key: EKey.o,
      description: 'open in browser',
      action() {
        if (!localUrl) {
          logger.warn('No URL available to open in browser');
          return;
        }
        openBrowser(localUrl);
      },
    },
    {
      key: EKey.q,
      description: 'quit',
      action() {
        logger.event(`Shutdown server`);
        process.exit(1);
      },
    },
  ];

  let active = false;

  const onKeypress = async (input: string) => {
    // ctrl+c or ctrl+d
    if (input === '\x03' || input === '\x04') {
      process.exit(1);
    }

    if (active) return;

    if (input === EKey.h) {
      console.log(`\n${chalk.bold('Shortcuts help')}:`);
      console.log(
        shortcuts
          .map(
            (shortcut) =>
              chalk.dim('  Press ') +
              chalk.cyan.bold(shortcut.key) +
              chalk.dim(` to ${shortcut.description}`),
          )
          .join('\n'),
      );
      console.log();
    }

    const shortcut = shortcuts.find((shortcut) => shortcut.key === input);
    if (!shortcut) {
      return;
    }

    active = true;
    await shortcut.action();
    active = false;
  };

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.on('keypress', onKeypress);
}
