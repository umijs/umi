import chalk from 'chalk';

require('../build')().catch(e => {
  console.error(chalk.red('构建出错'));
  console.log(e);
});
