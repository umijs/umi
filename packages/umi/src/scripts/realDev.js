import yParser from 'yargs-parser';
import buildDevOpts from '../buildDevOpts';

// 修复 Ctrl+C 时 dev server 没有正常退出的问题
process.on('SIGINT', () => {
  process.exit(1);
});

process.env.NODE_ENV = 'development';

const argv = yParser(process.argv.slice(2));
const opts = {
  ...argv,
  plugins: argv.plugins ? argv.plugins.split(',') : [],
};
const Service = require('umi-build-dev/lib/Service').default;
new Service(buildDevOpts(opts)).run('dev', opts);
