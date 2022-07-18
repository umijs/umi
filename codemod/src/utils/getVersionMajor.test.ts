import { getVersionMajor } from './getVersionMajor';

test('get version major', async () => {
  expect(getVersionMajor('^3.0.0')).toEqual('3');
  expect(getVersionMajor('3.0.0')).toEqual('3');
  expect(getVersionMajor('~3.1.1')).toEqual('3');
  expect(getVersionMajor('^3.x')).toEqual('3');
  expect(getVersionMajor('3.x')).toEqual('3');
});
