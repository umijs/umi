import { join } from 'path';
// import { Env, Service } from '../../core';
import { Service } from 'umi';

const base = join(__dirname, '../fixtures/antd');

process.env.APP_ROOT = base;

describe('antd plugin', () => {
  it('config moment to add webpack plugin', async () => {
    const service = new Service();
    // const appData: any = await service.run({ name: 'appData' });
    const appData: any = await service.run({ name: 'build' });

    // console.log(appData.config.antd);

    // Config is configured
    expect(appData.antd.version).toBeTruthy();
    expect(appData.config.antd.momentPicker).toBeTruthy();

    // Webpack is inject
  });
});
