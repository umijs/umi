import { isGitUrl, parseGitUrl, getParsedData } from './download';

describe('test block download utils', () => {
  it('isGitUrl', () => {
    expect(isGitUrl('test-block')).toEqual(false);
    expect(isGitUrl('ant-design-pro/Analysis')).toEqual(false);
    expect(isGitUrl('git@gitlab.alitest-inc.com:bigfish/bigfish.git')).toEqual(true);
    expect(isGitUrl('https://gitlab.alitest-inc.com/bigfish/bigfish.git')).toEqual(true);
    expect(isGitUrl('https://github.com/umijs/umi-blocks.git')).toEqual(true);
    expect(isGitUrl('https://github.com/umijs/umi-blocks/tree/master/demo')).toEqual(true);
    expect(
      isGitUrl('http://gitlab.alitest-inc.com/bigfish/bigfish-blocks/tree/master/demo'),
    ).toEqual(true);
    expect(isGitUrl('http://192.169.3.19/YYJay/test-umi-block/tree/master/demo')).toEqual(true);
  });

  it('parseGitUrl', async () => {
    expect(await parseGitUrl('git@github.com:umijs/bigfish.git', true)).toEqual({
      repo: 'git@github.com:umijs/bigfish.git',
      branch: 'umi@2',
      path: '/',
      id: 'github.com/umijs/bigfish',
    });
    expect(await parseGitUrl('git@gitlab.alitest-inc.com:bigfish/bigfish.git', true)).toEqual({
      repo: 'git@gitlab.alitest-inc.com:bigfish/bigfish.git',
      branch: 'umi@2',
      path: '/',
      id: 'gitlab.alitest-inc.com/bigfish/bigfish',
    });
    expect(await parseGitUrl('https://github.com/umijs/umi-blocks/tree/master/demo', true)).toEqual(
      {
        repo: 'https://github.com/umijs/umi-blocks.git',
        branch: 'umi@2',
        path: '/demo',
        id: 'github.com/umijs/umi-blocks',
      },
    );
    expect(
      await parseGitUrl(
        'https://github.com/umijs/umi-blocks/tree/master/ant-design-pro/Analysis',
        true,
      ),
    ).toEqual({
      repo: 'https://github.com/umijs/umi-blocks.git',
      branch: 'umi@2',
      path: '/ant-design-pro/Analysis',
      id: 'github.com/umijs/umi-blocks',
    });
    expect(
      await parseGitUrl(
        'http://gitlab.alitest-inc.com/bigfish/bigfish-blocks/tree/1.x/demo/test',
        true,
      ),
    ).toEqual({
      repo: 'http://gitlab.alitest-inc.com/bigfish/bigfish-blocks.git',
      branch: '1.x',
      path: '/demo/test',
      id: 'gitlab.alitest-inc.com/bigfish/bigfish-blocks',
    });
    expect(await parseGitUrl('http://gitlab.alitest-inc.com/bigfish/hello', true)).toEqual({
      repo: 'http://gitlab.alitest-inc.com/bigfish/hello.git',
      branch: 'umi@2',
      path: '/',
      id: 'gitlab.alitest-inc.com/bigfish/hello',
    });
    expect(await parseGitUrl('https://github.com/umijs/umi-blocks.git', true)).toEqual({
      repo: 'https://github.com/umijs/umi-blocks.git',
      branch: 'umi@2',
      path: '/',
      id: 'github.com/umijs/umi-blocks',
    });
    expect(
      await parseGitUrl('http://192.169.3.19/YYJay/test-umi-block/tree/master/demo', true),
    ).toEqual({
      repo: 'http://192.169.3.19/YYJay/test-umi-block.git',
      branch: 'umi@2',
      path: '/demo',
      id: '192.169.3.19/YYJay/test-umi-block',
    });
  });

  it('getParsedData', async () => {
    expect(
      await getParsedData('https://github.com/test/name/tree/somebranch/demo', {
        closeFastGithub: true,
      }),
    ).toEqual({
      branch: 'somebranch',
      id: 'github.com/test/name',
      path: '/demo',
      repo: 'https://github.com/test/name.git',
    });

    expect(await getParsedData('demo-test', { closeFastGithub: true })).toEqual({
      branch: 'umi@2',
      id: 'github.com/umijs/umi-blocks',
      path: '/demo-test',
      repo: 'https://github.com/umijs/umi-blocks.git',
    });
  });

  it('getParsedData with defaultGitUrl', async () => {
    const args = await getParsedData('https://github.com/test/name/tree/somebranch/demo', {
      defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
      closeFastGithub: true,
    });
    expect(args).toEqual({
      branch: 'somebranch',
      id: 'github.com/test/name',
      path: '/demo',
      repo: 'https://github.com/test/name.git',
    });

    expect(
      await getParsedData('demo-test', {
        defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
        closeFastGithub: true,
      }),
    ).toEqual({
      branch: 'umi@2',
      id: 'github.com/ant-design/pro-blocks',
      path: '/demo-test',
      repo: 'https://github.com/ant-design/pro-blocks.git',
    });
  });
});
