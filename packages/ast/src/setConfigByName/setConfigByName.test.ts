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

test('updates the top-level key without changing nested or unrelated keys', () => {
  const ast = parse(`const defaults = { title: 'Default' };
    export default defineConfig({
      routes: [{ title: 'Home' }],
      title: 'App',
    });`);
  expect(generate(setConfigByName(ast, 'title', 'New'))).toBe(
    code(`const defaults = { title: 'Default' };
      export default defineConfig({
        routes: [{ title: 'Home' }],
        title: "New",
      });`),
  );
});

test('updates a quoted top-level key without adding a duplicate', () => {
  const ast = parse("export default { 'hash': false };");
  expect(generate(setConfigByName(ast, 'hash', 'true'))).toBe(
    code("export default { 'hash': true };"),
  );
});

test('adds a missing top-level key without touching nested or computed keys', () => {
  const config =
    "const target = 'alias'; export default { [target]: 'computed', proxy: { '/api': { target: 'https://example.com' } } };";
  expect(generate(setConfigByName(parse(config), 'target', 'es5'))).toBe(
    code(
      "const target = 'alias'; export default { [target]: 'computed', proxy: { '/api': { target: 'https://example.com' } }, target: \"es5\" };",
    ),
  );
});

test('sets a shorthand property without changing its variable', () => {
  const config = 'const routes = [1]; export default defineConfig({ routes });';
  expect(generate(setConfigByName(parse(config), 'routes', '[]'))).toBe(
    code('const routes = [1]; export default defineConfig({ routes: [] });'),
  );
});

test('rejects an unsupported export without changing other objects', () => {
  const config =
    "const other = { title: 'Other' }; export default makeConfig();";
  const ast = parse(config);
  expect(() => setConfigByName(ast, 'title', 'New')).toThrow(
    "Can't modify config file",
  );
  expect(generate(ast)).toBe(code(config));
});

test.each([
  ['a local constant', 'const config = $object; export default config;'],
  [
    'a typed local constant passed to defineConfig',
    'const config = $object satisfies UmiConfig; export default defineConfig(config);',
  ],
  [
    'a local constant initialized with defineConfig',
    'const config = defineConfig($object); export default config;',
  ],
  ['an as assertion', 'export default ($object as UmiConfig);'],
  ['a satisfies expression', 'export default ($object satisfies UmiConfig);'],
])('updates the config through %s', (_label, template) => {
  const config = (title: string) =>
    template.replace(
      '$object',
      `{ routes: [{ title: 'Home' }], title: ${title} }`,
    );
  expect(
    generate(setConfigByName(parse(config("'Old'")), 'title', 'New')),
  ).toBe(code(config('"New"')));
});

test.each([
  "import config from './config'; export default config;",
  "let config = { title: 'Old' }; config = makeConfig(); export default config;",
  "const config = { title: 'Old' }; mutate(config); export default config;",
  "const config = makeConfig({ title: 'Old' }); export default config;",
  "const config = { title: 'Old' }; const alias = config; export default alias;",
  "const { config } = { config: { title: 'Old' }, title: 'Other' }; export default config;",
  "export default config; const config = { title: 'Old' };",
])(
  'does not edit a config with an indirect or mutable source: %s',
  (config) => {
    const ast = parse(config);
    expect(() => setConfigByName(ast, 'title', 'New')).toThrow(
      "Can't modify config file",
    );
    expect(generate(ast)).toBe(code(config));
  },
);

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
