import yParser from 'yargs-parser';
import create from '../create';

const argv = yParser(process.argv.slice(2));
const [name] = argv._;

create({
  name,
  isDva: argv.dva || false,
});
