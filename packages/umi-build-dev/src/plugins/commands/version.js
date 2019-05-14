import { join } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';

export default api => {
  api.registerCommand(
    'version',
    {
      description: 'show related versions',
    },
    args => {
      // eslint-disable-next-line import/no-dynamic-require
      const pkg = require(join(process.env.UMI_DIR, 'package.json'));
      if (args.verbose) {
        const versions = api.applyPlugins('addVersionInfo', {
          initialValue: [
            `umi@${pkg.version}`,
            `${process.platform} ${process.arch}`,
            `node@${process.version}`,
            `umi-build-dev@${require('../../../package').version}`,
            `af-webpack@${require('af-webpack/package').version}`,
            `babel-preset-umi@${require('babel-preset-umi/package').version}`,
            `umi-test@${require('umi-test/package').version}`,
          ],
        });
        versions.forEach(version => {
          console.log(version);
        });
      } else {
        console.log(pkg.version);
      }
      if (existsSync(join(process.env.UMI_DIR, '.local'))) {
        console.log(chalk.cyan('@local'));
      }
    },
  );
};
