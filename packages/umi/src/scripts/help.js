import yParser from 'yargs-parser';
import help from '../help';

const argv = yParser(process.argv.slice(2));
const [type] = argv._;

help({
  type,
});
