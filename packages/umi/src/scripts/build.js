import yParser from 'yargs-parser';
import build from '../build';

const argv = yParser(process.argv.slice(2));

build({
  ...argv,
  plugins: argv.plugins ? argv.plugins.split(',') : [],
});
