import { join } from 'path';
// import { Env, Service } from '../../core';
import { Service } from 'umi';

const base = join(__dirname, '../fixtures/antd');

process.env.APP_ROOT = base;

describe('antd plugin', () => {
  it('config check momentPicker', async () => {
    const service = new Service();
    const appData: any = await service.run({ name: 'appData' });

    // Config is configured
    expect(appData.antd.version).toBeTruthy();
    expect(appData.config.antd.momentPicker).toBeTruthy();

    await service.run({ name: 'chainWebpack' });
  });

  it.only('config moment to add webpack plugin', async () => {
    const service = new Service();
    const appData: any = await service.run({ name: 'chainWebpack' });

    // Webpack is inject
  });
});
