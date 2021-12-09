import { ModelUtils } from './utils/modelUtils';

// TODO: add test for dva and model
ModelUtils;
const isModelValid: any = function () {};

xtest('isModelValid empty', () => {
  expect(isModelValid({ content: '', file: 'a.ts' })).toEqual(false);
});

xtest('isModelValid comment', () => {
  expect(isModelValid({ content: '// @dva-model', file: 'a.ts' })).toEqual(
    true,
  );
});

xtest('isModelValid export default', () => {
  expect(
    isModelValid({ content: `export default { namespace: '' }`, file: 'a.ts' }),
  ).toEqual(true);
});

xtest('isModelValid export default + declaration', () => {
  expect(
    isModelValid({
      content: `const foo = { namespace: '' };export default foo;`,
      file: 'a.ts',
    }),
  ).toEqual(true);
});

xtest('isModelValid with typescript', () => {
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

xtest('isModelValid dva-model-extend', () => {
  expect(
    isModelValid({
      content: `import foo from 'dva-model-extend';
export default foo(model, { namespace: 'foo' });`,
      file: 'a.ts',
    }),
  ).toEqual(true);
});
