import test from '../test';
import yParser from 'yargs-parser';

const argv = yParser(process.argv.slice(2));

test({
  argv,
}).catch(e => {
  console.log(e);
  process.exit(1);
});
