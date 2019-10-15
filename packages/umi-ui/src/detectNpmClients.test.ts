import { join } from 'path';
import detectNpmClients from './detectNpmClients';

const base = '/tmp/sorrycc-uPAqBX';

xtest('normal', () => {
  expect(detectNpmClients(join(base, 'npm'))).toEqual(['npm']);
  expect(detectNpmClients(join(base, 'yarn'))).toEqual(['tyarn', 'yarn']);
  expect(detectNpmClients(join(base, 'ayarn'))).toEqual(['ayarn', 'yarn']);
  expect(detectNpmClients(join(base, 'tnpm'))).toEqual(['tnpm', 'cnpm', 'pnpm']);
});
