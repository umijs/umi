import outputPath from '../configPlugins/outputPath';

test('validate', () => {
  outputPath().validate('abc');
  expect(() => {
    outputPath().validate(1);
  }).toThrow(/Configure item outputPath should be String/);
});
