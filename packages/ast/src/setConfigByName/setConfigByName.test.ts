import { join } from 'path';
import { getASTByFilePath } from '../getASTByFilePath/getASTByFilePath';
import { generate } from '../utils/generate';
import { parse } from '../utils/parse';
import { setConfigByName } from './setConfigByName';

const fixtures = join(__dirname, '../../fixtures');
const cwd = join(fixtures, 'app');

test('normal', () => {
  const ast = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (!ast) return;
  const generateCode = generate(setConfigByName(ast!, 'abc', 'false')!);
  expect(generateCode).toContain('abc: false');
});

test('set object', () => {
  const ast = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (!ast) return;
  const generateCode = generate(
    setConfigByName(ast, 'p2', JSON.stringify({ react: 'aaa' }))!,
  );
  expect(generateCode).toContain('react');
});

test('set object with deep object', () => {
  const ast = parse('export default {}');
  const generateCode = generate(
    setConfigByName(
      ast,
      'p2',
      JSON.stringify({
        react: 'aaa',
        subP2: { a: 1, b: { d: 'ddd' }, c: true },
      }),
    )!,
  );
  expect(generateCode).toMatchInlineSnapshot(
    `"export default { p2: { "react": "aaa", "subP2": { "a": 1, "b": { "d": "ddd" }, "c": true } } };"`,
  );
});

test('set number', () => {
  const ast = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (!ast) return;
  const generateCode = generate(setConfigByName(ast, 'num', '2')!);
  expect(generateCode).toContain('num: 2');
});

test('set array', () => {
  const ast = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (!ast) return;
  const generateCode = generate(
    setConfigByName(ast, 'plugins', JSON.stringify(['./eee', './fff']))!,
  );
  expect(generateCode).toContain('eee');
});

test('set new config', () => {
  const ast = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (!ast) return;
  const generateCode = generate(setConfigByName(ast, 'aaa', 'true')!);
  expect(generateCode).toContain('aaa');
});

test('set config in export default defineConfig', () => {
  const ast = parse(`const c= {dav:{}}; export default defineConfig({...c})`);
  const generateCode = generate(setConfigByName(ast, 'tailwindcss', '{}')!);

  expect(generateCode).toEqual(
    code(
      `const c= {dav:{}}; export default defineConfig({...c,tailwindcss:{}})`,
    ),
  );
});

test('set config in export default object', () => {
  const ast = parse(`const c = {dva:{}}; export default {...c}`);
  const generateCode = generate(setConfigByName(ast, 'tailwindcss', '{}')!);

  expect(generateCode).toEqual(
    code(`const c = {dva:{}};export default {...c, tailwindcss:{}}`),
  );
});

function code(c: string) {
  return generate(parse(c));
}
