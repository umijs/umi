import { join } from 'path';
import { build } from './configBuilder';

const fixtures = join(__dirname, '../fixtures/configBuilder');

test('normal', async () => {
  const outputFile = join(fixtures, 'foo.out.js');
  await build({
    configFile: join(fixtures, 'foo.ts'),
    outputFile,
  });
  expect(require(outputFile).default).toEqual({
    foo: '111',
    bar: '222',
  });
});
