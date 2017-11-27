import yParser from 'yargs-parser';
import generate from '../generate';

const argv = yParser(process.argv.slice(2));
const [type, file] = argv._;

generate({
  type,
  file,
  useClass: argv.c || argv.class || false,
  isDirectory: argv.d || argv.directory || false,
});
