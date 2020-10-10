import { BundlerConfigType } from '@umijs/types';
import getTargetsAndBrowsersList from './getTargetsAndBrowsersList';

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
    type: BundlerConfigType.csr,
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
    type: BundlerConfigType.csr,
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
    type: BundlerConfigType.csr,
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
    type: BundlerConfigType.ssr,
  });
  expect(targets).toEqual({
    node: 6,
  });
  expect(browserslist).toEqual(['node >= 6']);
});
