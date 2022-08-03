import { chalk, logger } from '@umijs/utils';
import { DEFAULT_ESBUILD_TARGET_KEYS } from '../constants';
import { JSMinifier } from '../types';

interface IOpts {
  targets: Record<string, any>;
  jsMinifier: `${JSMinifier}`;
}

export function getEsBuildTarget({ targets, jsMinifier }: IOpts) {
  if (targets['ie'] && jsMinifier === JSMinifier.esbuild) {
    logger.error(
      `${chalk.red(
        `jsMinifier: esbuild`,
      )} is not supported when there is ie in the targets, you can use ${chalk.green(
        `jsMinifier: 'terser'`,
      )}`,
    );
    throw new Error('IE is not supported');
  }

  return Object.keys(targets)
    .filter((key) => DEFAULT_ESBUILD_TARGET_KEYS.includes(key))
    .map((key) => {
      return `${key}${targets[key] === true ? '0' : targets[key]}`;
    });
}
