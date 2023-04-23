import * as logger from '@umijs/utils/src/logger';
import 'zx/globals';
import { PATHS } from './.internal/constants';
import { getPkgs } from './.internal/utils';

(async () => {
  const pkgs = getPkgs();
  logger.info(`pkgs: ${pkgs.join(', ')}`);

  // sync tnpm
  logger.event('sync tnpm');
  $.verbose = false;
  await Promise.all(
    pkgs.map(async (pkg) => {
      const { name } = require(path.join(PATHS.PACKAGES, pkg, 'package.json'));
      logger.info(`sync ${name}`);
      await $`tnpm sync ${name}`;
    }),
  );
  $.verbose = true;
})();
