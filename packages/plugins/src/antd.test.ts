// import { PluginAPI } from '../../server/dist/server';
// packages/core/src/service/service.ts#L541
import { existsSync } from 'fs';
import { join } from 'path';
import { Service } from 'umi/dist/service/service';

const base = join(__dirname, '../../fixtures/service');

function buildService(opts: { name: string }) {
  const cwd = join(base, opts.name);
  const pluginPath = join(cwd, 'plugin.ts');

  console.log(pluginPath);

  return new Service({
    cwd,
    env: 'development',
    defaultConfigFiles: ['.umirc.ts', 'config/config.ts'],
    plugins: [(existsSync(pluginPath) && pluginPath) as string].filter(Boolean),
  });
}
describe('antd plugin', () => {
  it('config moment to add webpack plugin', async () => {
    const service = buildService({ name: 'umi-env' });
    const userConfig = await service.run({
      name: 'WhatToSetToGetWebPackConfig?',
    });
    console.log(userConfig);
  });
});
