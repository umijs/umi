import disableGlobalVariables from '../configPlugins/disableGlobalVariables';

test('validate', () => {
  disableGlobalVariables().validate(true);
  disableGlobalVariables().validate(false);
  expect(() => {
    disableGlobalVariables().validate(1);
  }).toThrow(/Configure item disableGlobalVariables should be Boolean/);
});
