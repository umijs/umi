import { PATHS } from './.internal/constants';
import { spawnSync } from './.internal/utils';

(async () => {
  spawnSync(
    `jest -c ${PATHS.JEST_TURBO_CONFIG} ${process.argv.slice(2).join(' ')}`,
    { cwd: process.cwd() },
  );
})();
