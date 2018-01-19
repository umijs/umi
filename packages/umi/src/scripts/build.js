import chalk from 'chalk';
import yParser from 'yargs-parser';
import build from '../build';

const argv = yParser(process.argv.slice(2));

build({
  plugins: argv.plugins ? argv.plugins.split(',') : [],
}).catch(e => {
  console.error(chalk.red('构建出错'));
  console.log(e);
});
