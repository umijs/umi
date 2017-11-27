import { resolve } from 'path';
import chalk from 'chalk';

require('umi-buildAndDev/lib/build')({
  babel: resolve(__dirname, '../babel'),
  enableCSSModules: true,
  extraResolveModules: [resolve(__dirname, '../../node_modules')],
  hash: true,
}).catch(e => {
  console.error(chalk.red('构建出错'));
  console.log(e);
});
