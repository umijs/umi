import { execaCommand } from '@umijs/utils/compiled/execa';
import yArgs from '@umijs/utils/compiled/yargs-parser';
import { join } from 'path';

(async () => {
  const args = yArgs(process.argv.slice(2));
  const scope = args.scope || '!@example/*';
  const extra = (args._ || []).join(' ');

  await turbo({ cmd: args.cmd, scope, extra, cache: args.cache });
})();

/**
 * Why use execa ?
 *  - `zx` not support color stdin on subprocess
 *  - see https://github.com/google/zx/blob/main/docs/known-issues.md#colors-in-subprocess
 *        https://github.com/google/zx/issues/212
 */
async function cmd(command: string) {
  try {
    return await execaCommand(command, {
      stdio: 'inherit',
      shell: true,
      cwd: join(__dirname, '../'),
    });
  } catch {}
}

async function turbo(opts: {
  scope: string;
  cmd: string;
  extra?: string;
  cache?: boolean;
}) {
  const extraCmd = opts.extra ? `-- -- ${opts.extra}` : '';
  const cacheCmd = opts.cache === false ? '--no-cache' : '';
  return cmd(
    `turbo run ${opts.cmd} --cache-dir=".turbo" --scope="${opts.scope}" --no-deps --include-dependencies ${cacheCmd} ${extraCmd}`,
  );
}
