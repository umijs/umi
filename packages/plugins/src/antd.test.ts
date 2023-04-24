import { existsSync } from 'fs-extra';
import { join } from 'path';
// import { Env, Service } from '../../core';
import { Service } from 'umi';

const base = join(__dirname, '../fixtures/service');

process.env.APP_ROOT = base;

function buildService(opts: { name: string }) {
  const cwd = join(base, opts.name);
  const pluginPath = join(cwd, 'plugin.ts');

  const plugins = [
    (existsSync(pluginPath) && pluginPath) as string,
    // antd plugin
    join(__dirname, './antd.ts'),
  ].filter(Boolean);

  return new Service({
    cwd,
    env: 'development',
    defaultConfigFiles: ['.umirc.ts', 'config/config.ts'],
    plugins,
  });
}

describe('antd plugin', () => {
  it('config moment to add webpack plugin', async () => {
    const service = buildService({ name: 'umi-env' });
    const userConfig = await service.run({ name: 'userConfig' });

    console.log(userConfig);
  });
});
