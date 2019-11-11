import outputPath from '../configPlugins/outputPath';

test('validate', () => {
  outputPath().validate('abc');
  expect(() => {
    outputPath().validate(1);
  }).toThrow(/Configure item outputPath should be String/);
  expect(() => {
    outputPath().validate('src');
  }).toThrow(/The outputPath config is not allowed to be set to src/);
});
