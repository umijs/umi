import base from '../configPlugins/base';

test('validate', () => {
  base().validate('abc');
  expect(() => {
    base().validate(1);
  }).toThrow(/Configure item base should be String/);
});
