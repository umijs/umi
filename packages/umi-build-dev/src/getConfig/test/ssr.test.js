import ssr from '../configPlugins/ssr';

test('validate', () => {
  ssr().validate(true);
  ssr().validate(false);
  ssr().validate({});
  expect(() => {
    ssr().validate(1);
  }).toThrow(/Configure item ssr should be Boolean or Plain Object/);
});
