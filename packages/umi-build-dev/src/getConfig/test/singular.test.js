import singular from '../configPlugins/singular';

test('validate', () => {
  singular().validate(true);
  singular().validate(false);
  expect(() => {
    singular().validate(1);
  }).toThrow(/Configure item singular should be Boolean/);
});
