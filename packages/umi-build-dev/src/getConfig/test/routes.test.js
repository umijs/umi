import routes from '../configPlugins/routes';

test('validate', () => {
  routes().validate([]);
  expect(() => {
    routes().validate(1);
  }).toThrow(/Configure item routes should be Array/);
});
