import exportStatic from '../configPlugins/exportStatic';

test('validate', () => {
  exportStatic().validate(true);
  exportStatic().validate(false);
  exportStatic().validate({});
  expect(() => {
    exportStatic().validate(1);
  }).toThrow(/Configure item exportStatic should be Boolean or Plain Object/);
});
