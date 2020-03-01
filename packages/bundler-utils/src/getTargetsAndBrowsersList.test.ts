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
    ie: 10,
  });
  expect(browserslist).toEqual(['ie >= 10', 'chrome >= 0', 'firefox >= 0']);
});

test('csr with null targets', () => {
  const { targets, browserslist } = getTargetsAndBrowsersList({
    config: {},
    type: ConfigType.csr,
  });
  expect(targets).toEqual({});
  expect(browserslist).toEqual([]);
});

test('csr targets with false', () => {
  const { targets } = getTargetsAndBrowsersList({
    config: {
      targets: {
        foo: 1,
        bar: false,
      },
    },
    type: ConfigType.csr,
  });
  expect(targets).toEqual({
    foo: 1,
  });
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
