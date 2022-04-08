import spawn from '@umijs/utils/compiled/cross-spawn';
import yArgs from '@umijs/utils/compiled/yargs-parser';
import * as logger from '@umijs/utils/src/logger';
import { join } from 'path';

(async () => {
  const args = yArgs(process.argv.slice(2));
  const filter = args.filter || './packages/*';
  const extra = (args._ || []).join(' ');

  await turbo({
    cmd: args.cmd,
    filter,
    extra,
    cache: args.cache,
    parallel: args.parallel,
  });
})();

/**
 * Why not use zx ?
 *  - `zx` not support color stdin on subprocess
 *  - see https://github.com/google/zx/blob/main/docs/known-issues.md#colors-in-subprocess
 *        https://github.com/google/zx/issues/212
 */
async function cmd(command: string) {
  const result = spawn.sync(command, {
    stdio: 'inherit',
    shell: true,
    cwd: join(__dirname, '../'),
  });
  if (result.status !== 0) {
    // sub package command don't stop when execute fail.
    // display exit
    logger.error(`Execute command error (${command})`);
    process.exit(1);
  }
  return result;
}

async function turbo(opts: {
  filter: string;
  cmd: string;
  extra?: string;
  cache?: boolean;
  parallel?: boolean;
}) {
  const extraCmd = opts.extra ? `-- -- ${opts.extra}` : '';
  const cacheCmd = opts.cache === false ? '--no-cache --force' : '';
  const parallelCmd = opts.parallel ? '--parallel' : '';

  const options = [
    opts.cmd,
    `--cache-dir=".turbo"`,
    `--filter="${opts.filter}"`,
    cacheCmd,
    parallelCmd,
    extraCmd,
  ]
    .filter(Boolean)
    .join(' ');

  return cmd(`turbo run ${options}`);
}
