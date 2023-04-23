import { update } from './configUpdater';

test('del', () => {
  expect(
    update({
      code: `export default { foo: 1, bar: 2 };`,
      filePath: ``,
      updates: {
        del: ['foo'],
      },
    }).config.code,
  ).toEqual(`export default { bar: 2 };`);
});

test('del deep', () => {
  expect(
    update({
      code: `export default { foo: 1, bar: { baz: 3, hoo: 4 } };`,
      filePath: ``,
      updates: {
        del: ['bar.baz'],
      },
    }).config.code,
  ).toEqual(`export default { foo: 1, bar: { hoo: 4 } };`);
});

test('set', () => {
  expect(
    update({
      code: `export default {};`,
      filePath: ``,
      updates: {
        set: { foo: 'bar' },
      },
    }).config.code,
  ).toEqual(`export default { foo: "bar" };`);
});

test('set with object', () => {
  expect(
    update({
      code: `export default {};`,
      filePath: ``,
      updates: {
        set: { foo: { bar: 1 } },
      },
    }).config.code,
  ).toEqual(`export default { foo: { bar: 1 } };`);
});

test('set modify', () => {
  expect(
    update({
      code: `export default { foo: 1 };`,
      filePath: ``,
      updates: {
        set: { foo: 'bar' },
      },
    }).config.code,
  ).toEqual(`export default { foo: "bar" };`);
});

test('set deep', () => {
  expect(
    update({
      code: `export default {};`,
      filePath: ``,
      updates: {
        set: { 'foo.baz': 'bar' },
      },
    }).config.code,
  ).toEqual(`export default { foo: { baz: "bar" } };`);
});

test('defineConfig', () => {
  expect(
    update({
      code: `export default defineConfig({});`,
      filePath: ``,
      updates: {
        set: { foo: 'bar' },
      },
    }).config.code,
  ).toEqual(`export default defineConfig({ foo: "bar" });`);
});

test('get binding', () => {
  expect(
    update({
      code: `const config = {}; export default config;`,
      filePath: ``,
      updates: {
        set: { foo: 'bar' },
      },
    }).config.code,
  ).toEqual(`const config = { foo: "bar" };export default config;`);
});

test('get binding + defineConfig', () => {
  expect(
    update({
      code: `const config = {}; export default defineConfig(config);`,
      filePath: ``,
      updates: {
        set: { foo: 'bar' },
      },
    }).config.code,
  ).toEqual(
    `const config = { foo: "bar" };export default defineConfig(config);`,
  );
});

test('routes', () => {
  expect(
    update({
      code: `import routes from './routes'; export default { routes };`,
      filePath: `/foo`,
      routeCode: `export default [{ foo: 1, bar: 2 }];`,
      routesUpdates: {
        del: ['foo'],
      },
    }).routesConfig!.code,
  ).toEqual(`export default [{ bar: 2 }];`);
});
