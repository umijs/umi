import chainWebpack from '../configPlugins/chainWebpack';

test('validate', () => {
  chainWebpack().validate(() => {});
  expect(() => {
    chainWebpack().validate(1);
  }).toThrow(/Configure item chainWebpack should be Function/);
});
