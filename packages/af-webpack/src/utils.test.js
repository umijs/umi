import * as utils from './utils';

test('stripLastSlash', () => {
  expect(utils.stripLastSlash('/foo')).toEqual('/foo');
  expect(utils.stripLastSlash('/foo/')).toEqual('/foo');
});
