import { Service } from '@umijs/core';
import { join } from 'path';

const fixtures = join(__dirname, '../../../fixtures');

xtest('dev', (done) => {
  const cwd = join(fixtures, 'dev');
  process.env.WATCH = 'none';

  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
    env: 'development',
  });
  service
    .run({
      name: 'dev',
    })
    .then(({ port, hostname, listeningApp, server, destroy }: any) => {
      console.log(`test`, hostname, port);
      service.on('firstDevCompileDone', () => {
        console.log('firstDevCompileDone', 'h');
        destroy();
        console.log(2);
        done();
      });
    });
});
