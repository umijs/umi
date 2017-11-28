import chalk from 'chalk';
import build from '../build';

build().catch(e => {
  console.error(chalk.red('构建出错'));
  console.log(e);
});
