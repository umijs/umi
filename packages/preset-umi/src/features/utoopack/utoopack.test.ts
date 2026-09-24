import { Env, Service } from '@umijs/core';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const plugins = [
  require.resolve('../../registerMethods'),
  require.resolve('../mako/mako'),
  require.resolve('../okam/okam'),
  require.resolve('./utoopack'),
  require.resolve('../../commands/version'),
];

async function resolveBundlerConfig(userConfig: Record<string, unknown>) {
  const cwd = mkdtempSync(join(tmpdir(), 'umi-bundler-priority-'));
  writeFileSync(
    join(cwd, '.umirc.js'),
    `exports.default = ${JSON.stringify(userConfig)};`,
  );

  try {
    const service = new Service({
      cwd,
      env: Env.test,
      defaultConfigFiles: ['.umirc.js'],
      plugins,
    });
    await service.run({ name: 'version', args: { quiet: true } });
    return service;
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

test('utoopack takes priority when mako is also configured', async () => {
  const service = await resolveBundlerConfig({ mako: {}, utoopack: {} });
  expect(service.appData.bundler).toBe('utoopack');
  expect(service.config.mako).toBe(false);
  expect(service.isPluginEnable('mako')).toBe(false);
  expect(service.isPluginEnable('okam')).toBe(false);
});

test('mako remains active without utoopack', async () => {
  const service = await resolveBundlerConfig({ mako: {} });

  expect(service.appData.bundler).toBe('mako');
  expect(service.isPluginEnable('mako')).toBe(true);
});
