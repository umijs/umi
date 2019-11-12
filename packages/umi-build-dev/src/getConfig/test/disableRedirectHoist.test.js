import disableRedirectHoist from '../configPlugins/disableRedirectHoist';

test('validate', () => {
  disableRedirectHoist().validate(true);
  disableRedirectHoist().validate(false);
  expect(() => {
    disableRedirectHoist().validate(1);
  }).toThrow(/Configure item disableRedirectHoist should be Boolean/);
});
