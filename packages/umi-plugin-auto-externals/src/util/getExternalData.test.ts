import getExternalData from './getExternalData';

test('empty', () => {
  const configs = getExternalData({
    pkg: {},
    config: {},
    versionInfos: [],
    packages: [],
  });
  expect(configs).toEqual([]);
});
