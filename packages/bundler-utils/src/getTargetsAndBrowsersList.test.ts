import getTargetsAndBrowsersList from './getTargetsAndBrowsersList';
import { ConfigType } from './enums';

const configTargets = {
  ie: 10,
  node: 6,
  chrome: 0,
  firefox: true,
};

test('csr', () => {
  const { targets, browserslist } = getTargetsAndBrowsersList({
    config: {
      targets: configTargets,
    },
    type: ConfigType.csr,
  });
  expect(targets).toEqual({
    chrome: 0,
    firefox: true,
    safari: 10,
    edge: 13,
    ios: 10,
    ie: 10,
  });
  expect(browserslist).toEqual([
    'chrome >= 0',
    'firefox >= 0',
    'safari >= 10',
    'edge >= 13',
    'ios >= 10',
    'ie >= 10',
  ]);
});

test('ssr', () => {
  const { targets, browserslist } = getTargetsAndBrowsersList({
    config: {
      targets: configTargets,
    },
    type: ConfigType.ssr,
  });
  expect(targets).toEqual({
    node: 6,
  });
  expect(browserslist).toEqual(['node >= 6']);
});
