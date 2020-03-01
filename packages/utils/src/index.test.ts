import * as utils from './index';

test('normal', () => {
  expect(Object.keys(utils).length).toBeGreaterThan(1);
});
