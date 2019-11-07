import runtimePublicPath from '../configPlugins/runtimePublicPath';

test('validate', () => {
  runtimePublicPath().validate(true);
  runtimePublicPath().validate(false);
  expect(() => {
    runtimePublicPath().validate(1);
  }).toThrow(/Configure item runtimePublicPath should be Boolean/);
});
