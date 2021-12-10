import { getModelUtil } from './dva';

function isModelValid(opts: { content: string; file: string }) {
  return getModelUtil(null).isModelValid(opts);
}

test('isModelValid empty', () => {
  expect(isModelValid({ content: '', file: 'a.ts' })).toEqual(false);
});

test('isModelValid comment', () => {
  expect(isModelValid({ content: '// @dva-model', file: 'a.ts' })).toEqual(
    true,
  );
});

test('isModelValid export default', () => {
  expect(
    isModelValid({ content: `export default { namespace: '' }`, file: 'a.ts' }),
  ).toEqual(true);
});

test('isModelValid export default + declaration', () => {
  expect(
    isModelValid({
      content: `const foo = { namespace: '' };export default foo;`,
      file: 'a.ts',
    }),
  ).toEqual(true);
});

test('isModelValid with typescript', () => {
  expect(
    isModelValid({
      content: `export default <Model>{ namespace: '' }`,
      file: 'a.ts',
    }),
  ).toEqual(true);
  expect(
    isModelValid({
      content: `export default <Model<SubModel>>{ namespace: '' }`,
      file: 'a.ts',
    }),
  ).toEqual(true);
  expect(
    isModelValid({
      content: `export default { namespace: '' } as Model`,
      file: 'a.ts',
    }),
  ).toEqual(true);
  expect(
    isModelValid({
      content: `const foo: Model = { namespace: '' };export default foo;`,
      file: 'a.ts',
    }),
  ).toEqual(true);
});

test('isModelValid dva-model-extend', () => {
  expect(
    isModelValid({
      content: `import foo from 'dva-model-extend';
export default foo(model, { namespace: 'foo' });`,
      file: 'a.ts',
    }),
  ).toEqual(true);
});
