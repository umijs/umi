import plugins from '../configPlugins/plugins';

test('validate', () => {
  plugins().validate([]);
  expect(() => {
    plugins().validate(1);
  }).toThrow(/Configure item plugins should be Array/);
});
