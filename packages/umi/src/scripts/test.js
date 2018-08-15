process.env.NODE_ENV = 'development';

const Service = require('umi-build-dev/lib/Service').default;
new Service(process.argv.slice(2)).run('test');
