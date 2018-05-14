import test from '../test';

const args = process.argv.slice(2);

const watch = args.indexOf('-w') > -1 || args.indexOf('--watch') > -1;
const coverage = args.indexOf('--coverage') > -1;

test({
  watch,
  coverage,
}).catch(e => {
  console.log(e);
  process.exit(1);
});
