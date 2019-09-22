import treeShaking from '../configPlugins/treeShaking';

test('validate', () => {
  treeShaking().validate(true);
  treeShaking().validate(false);
  expect(() => {
    treeShaking().validate(1);
  }).toThrow(/Configure item treeShaking should be Boolean/);
});
