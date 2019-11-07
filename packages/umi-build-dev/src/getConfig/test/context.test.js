import context from '../configPlugins/context';

test('validate', () => {
  context().validate(true);
  context().validate(false);
  context().validate({});
  expect(() => {
    context().validate(1);
  }).toThrow(/Configure item context should be Boolean or Plain Object/);
});
