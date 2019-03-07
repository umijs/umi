import AJV from 'ajv';
import schema from './schema';

const ajv = new AJV();

const successValidates = {
  entry: ['a', ['a']],
  file: ['a'],
  esm: [
    false,
    true,
    { type: 'rollup' },
    { type: 'babel' },
    { file: 'a' },
    { mjs: true },
  ],
  cjs: [false, true, { type: 'rollup' }, { type: 'babel' }, { file: 'a' }],
  umd: [
    { globals: {} },
    { file: 'a' },
    { name: 'a' },
    { minFile: false },
    { minFile: true },
  ],
  extraBabelPlugins: [[]],
  extraBabelPresets: [[]],
  extraPostCSSPlugins: [[]],
  cssModules: [true, false, {}],
  autoprefixer: [{}],
  namedExports: [{}],
  runtimeHelpers: [true, false],
  target: ['node', 'browser'],
  overridesByEntry: [{}],
  doc: [{}],
};

Object.keys(successValidates).forEach(key => {
  test(key, () => {
    successValidates[key].forEach(item => {
      expect(
        ajv.validate(schema, {
          [key]: item,
        }),
      ).toEqual(true);
    });
  });
});
