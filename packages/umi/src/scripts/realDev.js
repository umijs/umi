// 修复 Ctrl+C 时 dev server 没有正常退出的问题
process.on('SIGINT', () => {
  process.exit(1);
});

process.env.NODE_ENV = 'development';

const Service = require('umi-build-dev/lib/Service').default;
new Service(process.argv.slice(2)).run('dev');
