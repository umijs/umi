import { spawnSync } from './.internal/utils';

(async () => {
  const args = process.argv.slice(2);

  const isBuild = args.includes('build');
  if (isBuild) {
    args.push('--quiet');
  }

  const command = `father ${args.join(' ')}`;

  spawnSync(command, { cwd: process.cwd() });
})();
