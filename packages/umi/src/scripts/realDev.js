import yParser from 'yargs-parser';
import dev from '../dev';

const argv = yParser(process.argv.slice(2));

// 修复 Ctrl+C 时 dev server 没有正常退出的问题
process.on('SIGINT', () => {
  process.exit(1);
});

dev({
  plugins: argv.plugins ? argv.plugins.split(',') : [],
}).catch(e => {
  console.log(e);
  process.exit(1);
});
