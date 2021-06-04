import { Service } from '@umijs/core';
import { generateTmp } from '@umijs/test-utils';
import { readFileSync } from 'fs';
import { join } from 'path';

const fixtures = join(__dirname, 'fixtures', 'polyfill');

test('normal', async () => {
  const cwd = join(fixtures, 'normal');
  await generateTmp({
    cwd,
    Service,
  });
  const content = readFileSync(
    join(cwd, '.umi-test', 'core', 'polyfill.ts'),
    'utf-8',
  );
  expect(content).toContain(`import 'core-js';`);
  expect(content).toContain(`import 'regenerator-runtime/runtime';`);
});

test('imports', async () => {
  const cwd = join(fixtures, 'imports');
  await generateTmp({
    cwd,
    Service,
  });
  const content = readFileSync(
    join(cwd, '.umi-test', 'core', 'polyfill.ts'),
    'utf-8',
  );
  expect(content).toContain(`import 'core-js/es/array';`);
  expect(content).toContain(`import 'core-js/proposals/math-extensions';`);
});
