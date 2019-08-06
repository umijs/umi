import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import Service from '../../../../umi-build-dev/src/Service';

const fixtures = join(__dirname, 'fixtures');

test('org.umi.config.list', async () => {
  return new Promise((resolve, reject) => {
    const service = new Service({
      cwd: join(fixtures, 'normal'),
    });
    service.init();
    service.applyPlugins('onUISocket', {
      args: {
        action: { type: 'org.umi.config.list' },
        success({ data }) {
          expect(Array.isArray(data)).toEqual(true);
          expect(data.length > 1).toEqual(true);
          resolve();
        },
        failure(e) {
          reject(e);
        },
      },
    });
  });
});

test('org.umi.config.edit', async () => {
  return new Promise((resolve, reject) => {
    const service = new Service({
      cwd: join(fixtures, 'normal'),
    });
    service.init();
    service.applyPlugins('onUISocket', {
      args: {
        action: {
          type: 'org.umi.config.edit',
          payload: {
            key: 'history',
            value: 'hash',
          },
        },
        success() {
          const configFile = join(fixtures, 'normal', '.umirc.js');
          const newConfig = readFileSync(configFile, 'utf-8');
          expect(newConfig.trim()).toEqual(
            `
export default {
  history: 'hash',
};
          `.trim(),
          );
          writeFileSync(configFile, `export default {}`, 'utf-8');
          resolve();
        },
        failure(e) {
          reject(e);
        },
      },
    });
  });
});
