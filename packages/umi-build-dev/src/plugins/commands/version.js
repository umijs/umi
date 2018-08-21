import { join } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';

export default api => {
  api.registerCommand(
    'version',
    {
      description: 'show related versions',
    },
    () => {
      const pkg = require(join(process.env.UMI_DIR, 'package.json'));
      const versions = api.applyPlugins('addVersionInfo', {
        initialValue: [
          `umi@${pkg.version}`,
          `umi-build-dev@${require('../../../package').version}`,
          `af-webpack@${require('af-webpack/package').version}`,
          `babel-preset-umi@${require('babel-preset-umi/package').version}`,
          `umi-test@${require('umi-test/package').version}`,
        ],
      });
      if (existsSync(join(process.env.UMI_DIR, '.local'))) {
        versions.push(chalk.cyan('@local'));
      }
      versions.forEach(version => {
        console.log(version);
      });
    },
  );
};
