import { PATHS } from './.internal/constants';
import { spawnSync } from './.internal/utils';

(async () => {
  const args = process.argv.slice(2);
  console.log('args: ', args);

  // no cache
  if (args.includes('--no-cache')) {
    args.unshift('--force');
  }

  // filter
  if (!args.includes('--filter')) {
    args.unshift('--filter', `'./packages/*'`);
  }

  // turbo cache
  if (!args.includes('--cache-dir')) {
    args.unshift('--cache-dir', `'.turbo'`);
  }

  const command = `turbo run ${args.join(' ')}`;
  console.log('command: ', command);

  spawnSync(command, { cwd: PATHS.ROOT });
})();
