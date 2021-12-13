import { join } from 'path';
import { Env } from '../types';
import { Service } from './service';

const base = join(__dirname, '../../fixtures/service');

function buildService(opts: { name: string }) {
  return new Service({
    cwd: join(base, opts.name),
    env: Env.development,
    defaultConfigFiles: ['.umirc.ts'],
  });
}

test('plugin should not return', async () => {
  const service = buildService({ name: 'plugin-should-not-return' });
  await expect(service.run({ name: 'test' })).rejects.toThrow(
    /plugin should return nothing/,
  );
});
