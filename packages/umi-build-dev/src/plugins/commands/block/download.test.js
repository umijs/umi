import { isGitUrl, parseGitUrl, getParsedData } from './download';

describe('test block download utils', () => {
  it('isGitUrl', () => {
    expect(isGitUrl('test-block')).toEqual(false);
    expect(isGitUrl('ant-design-pro/Analysis')).toEqual(false);
    expect(isGitUrl('git@gitlab.alitest-inc.com:bigfish/bigfish.git')).toEqual(true);
    expect(isGitUrl('https://gitlab.alitest-inc.com/bigfish/bigfish.git')).toEqual(true);
    expect(isGitUrl('https://github.com/umijs/umi-blocks')).toEqual(true);
    expect(isGitUrl('https://github.com/umijs/umi-blocks/tree/master/demo')).toEqual(true);
    expect(
      isGitUrl('http://gitlab.alitest-inc.com/bigfish/bigfish-blocks/tree/master/demo'),
    ).toEqual(true);
  });

  it('parseGitUrl', () => {
    expect(parseGitUrl('git@github.com:umijs/bigfish.git')).toEqual({
      repo: 'git@github.com:umijs/bigfish.git',
      branch: 'master',
      path: '/',
      id: 'github.com/umijs/bigfish',
    });
    expect(parseGitUrl('git@gitlab.alitest-inc.com:bigfish/bigfish.git')).toEqual({
      repo: 'git@gitlab.alitest-inc.com:bigfish/bigfish.git',
      branch: 'master',
      path: '/',
      id: 'gitlab.alitest-inc.com/bigfish/bigfish',
    });
    expect(parseGitUrl('https://github.com/umijs/umi-blocks/tree/master/demo')).toEqual({
      repo: 'https://github.com/umijs/umi-blocks.git',
      branch: 'master',
      path: '/demo',
      id: 'github.com/umijs/umi-blocks',
    });
    expect(
      parseGitUrl('https://github.com/umijs/umi-blocks/tree/master/ant-design-pro/Analysis'),
    ).toEqual({
      repo: 'https://github.com/umijs/umi-blocks.git',
      branch: 'master',
      path: '/ant-design-pro/Analysis',
      id: 'github.com/umijs/umi-blocks',
    });
    expect(
      parseGitUrl('http://gitlab.alitest-inc.com/bigfish/bigfish-blocks/tree/1.x/demo/test'),
    ).toEqual({
      repo: 'http://gitlab.alitest-inc.com/bigfish/bigfish-blocks.git',
      branch: '1.x',
      path: '/demo/test',
      id: 'gitlab.alitest-inc.com/bigfish/bigfish-blocks',
    });
    expect(parseGitUrl('http://gitlab.alitest-inc.com/bigfish/hello')).toEqual({
      repo: 'http://gitlab.alitest-inc.com/bigfish/hello.git',
      branch: 'master',
      path: '/',
      id: 'gitlab.alitest-inc.com/bigfish/hello',
    });
    expect(parseGitUrl('https://github.com/umijs/umi-blocks')).toEqual({
      repo: 'https://github.com/umijs/umi-blocks.git',
      branch: 'master',
      path: '/',
      id: 'github.com/umijs/umi-blocks',
    });
  });

  it('getParsedData', () => {
    expect(getParsedData('https://github.com/test/name/tree/somebranch/demo', {})).toEqual({
      branch: 'somebranch',
      id: 'github.com/test/name',
      path: '/demo',
      repo: 'https://github.com/test/name.git',
    });

    expect(getParsedData('demo-test', {})).toEqual({
      branch: 'master',
      id: 'github.com/umijs/umi-blocks',
      path: '/demo-test',
      repo: 'https://github.com/umijs/umi-blocks.git',
    });
  });

  it('getParsedData with defaultGitUrl', () => {
    expect(
      getParsedData('https://github.com/test/name/tree/somebranch/demo', {
        defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
      }),
    ).toEqual({
      branch: 'somebranch',
      id: 'github.com/test/name',
      path: '/demo',
      repo: 'https://github.com/test/name.git',
    });

    expect(
      getParsedData('demo-test', {
        defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
      }),
    ).toEqual({
      branch: 'master',
      id: 'github.com/ant-design/pro-blocks',
      path: '/demo-test',
      repo: 'https://github.com/ant-design/pro-blocks.git',
    });
  });
});
