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

test('boolean', () => {
  const configs = getExternalData({
    pkg: {
      dependencies: {
        moment: '2.24.0',
        antd: '3.16.3',
        jquery: '3',
      },
    },
    config: {
      externals: {},
    },
    versionInfos: [
      'react@16.6.3 (react@16.6.3@react)',
      'react-dom@16.6.3 (react-dom@16.6.3@react-dom)',
    ],
    packages: true,
  });
  const keys = configs.map(item => item.key);
  expect(keys).toEqual(['react', 'react-dom', 'moment', 'antd', 'jquery']);
});

test('external antd', () => {
  const configs = getExternalData({
    pkg: {
      dependencies: {
        moment: '2.24.0',
        antd: '3.16.3',
        jquery: '3',
      },
    },
    config: {
      externals: {},
    },
    versionInfos: [
      'react@16.6.3 (react@16.6.3@react)',
      'react-dom@16.6.3 (react-dom@16.6.3@react-dom)',
    ],
    packages: ['antd'],
  });
  const keys = configs.map(item => item.key);
  expect(keys).toEqual(['react', 'react-dom', 'moment', 'antd']);
});

test('external react', () => {
  const configs = getExternalData({
    pkg: {
      dependencies: {
        moment: '2.24.0',
        antd: '3.16.3',
        jquery: '3',
      },
    },
    config: {
      externals: {},
    },
    versionInfos: [
      'react@16.6.3 (react@16.6.3@react)',
      'react-dom@16.6.3 (react-dom@16.6.3@react-dom)',
    ],
    packages: ['react'],
  });
  const keys = configs.map(item => item.key);
  expect(keys).toEqual(['react']);
});

test('external react-dom', () => {
  const configs = getExternalData({
    pkg: {
      dependencies: {
        moment: '2.24.0',
        antd: '3.16.3',
        jquery: '3',
      },
    },
    config: {
      externals: {},
    },
    versionInfos: [
      'react@16.6.3 (react@16.6.3@react)',
      'react-dom@16.6.3 (react-dom@16.6.3@react-dom)',
    ],
    packages: ['react-dom'],
  });
  const keys = configs.map(item => item.key);
  expect(keys).toEqual(['react', 'react-dom']);
});

test('auto external conflict with externals config', () => {
  try {
    getExternalData({
      pkg: {
        dependencies: {
          moment: '2.24.0',
          antd: '3.16.3',
          jquery: '3',
        },
      },
      config: {
        externals: {
          react: '16',
        },
      },
      versionInfos: [
        'react@16.6.3 (react@16.6.3@react)',
        'react-dom@16.6.3 (react-dom@16.6.3@react-dom)',
      ],
      packages: ['react-dom'],
    });
    throw new Error('will not throw');
  } catch (e) {
    expect(e.message).toMatch(/react is is both in external and autoExternals/);
  }
});

test('moment not in dependencies', () => {
  try {
    getExternalData({
      pkg: {},
      config: {},
      versionInfos: [
        'react@16.6.3 (react@16.6.3@react)',
        'react-dom@16.6.3 (react-dom@16.6.3@react-dom)',
      ],
      packages: ['moment'],
    });
    throw new Error('will not throw');
  } catch (e) {
    expect(e.message).toMatch(/Can not find dependencies\(moment\) version/);
  }
});
