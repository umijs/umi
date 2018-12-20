import { join } from 'path';
import { isGitUrl, parseGitUrl, getPathWithUrl } from './download';

describe('test block download utils', () => {
  it('isGitUrl', () => {
    expect(isGitUrl('test-block')).toEqual(false);
    expect(isGitUrl('ant-design-pro/Analysis')).toEqual(false);
    expect(isGitUrl('git@gitlab.alitest-inc.com:bigfish/bigfish.git')).toEqual(
      true,
    );
    expect(
      isGitUrl('https://gitlab.alitest-inc.com/bigfish/bigfish.git'),
    ).toEqual(true);
    expect(isGitUrl('https://github.com/umijs/umi-blocks')).toEqual(true);
    expect(
      isGitUrl('https://github.com/umijs/umi-blocks/tree/master/demo'),
    ).toEqual(true);
    expect(
      isGitUrl(
        'http://gitlab.alitest-inc.com/bigfish/bigfish-blocks/tree/master/demo',
      ),
    ).toEqual(true);
  });

  it('parseGitUrl', () => {
    expect(parseGitUrl('git@github.com:umijs/bigfish.git')).toEqual({
      repo: 'git@github.com:umijs/bigfish.git',
      branch: 'master',
      path: '/',
      id: 'github.com/umijs/bigfish',
    });
    expect(
      parseGitUrl('git@gitlab.alitest-inc.com:bigfish/bigfish.git'),
    ).toEqual({
      repo: 'git@gitlab.alitest-inc.com:bigfish/bigfish.git',
      branch: 'master',
      path: '/',
      id: 'gitlab.alitest-inc.com/bigfish/bigfish',
    });
    expect(
      parseGitUrl('https://github.com/umijs/umi-blocks/tree/master/demo'),
    ).toEqual({
      repo: 'https://github.com/umijs/umi-blocks.git',
      branch: 'master',
      path: '/demo',
      id: 'github.com/umijs/umi-blocks',
    });
    expect(
      parseGitUrl(
        'https://github.com/umijs/umi-blocks/tree/master/ant-design-pro/Analysis',
      ),
    ).toEqual({
      repo: 'https://github.com/umijs/umi-blocks.git',
      branch: 'master',
      path: '/ant-design-pro/Analysis',
      id: 'github.com/umijs/umi-blocks',
    });
    expect(
      parseGitUrl(
        'http://gitlab.alitest-inc.com/bigfish/bigfish-blocks/tree/1.x/demo/test',
      ),
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

  xit('getPathWithUrl', () => {
    const mockLog = {
      log: () => {},
      info: () => {},
      success: () => {},
    };
    expect(
      getPathWithUrl(
        'https://github.com/umijs/umi-blocks/tree/master/demo',
        mockLog,
        {
          dryRun: true,
        },
      ),
    ).toEqual('/Users/test/.umi/blocks/github.com/umijs/umi-blocks/demo');
    expect(
      getPathWithUrl('git@github.com:umijs/testblock.git', mockLog, {
        dryRun: true,
      }),
    ).toEqual('/Users/test/.umi/blocks/github.com/umijs/testblock/');
    expect(
      getPathWithUrl('demo-test', mockLog, {
        dryRun: true,
      }),
    ).toEqual('/Users/test/.umi/blocks/github.com/umijs/umi-blocks/demo-test');
    expect(
      getPathWithUrl('ant-design-pro/Analysis', mockLog, {
        dryRun: true,
      }),
    ).toEqual(
      '/Users/test/.umi/blocks/github.com/umijs/umi-blocks/ant-design-pro/Analysis',
    );
    expect(
      getPathWithUrl('/test/test/locale', mockLog, {
        dryRun: true,
      }),
    ).toEqual('/test/test/locale');
    expect(
      getPathWithUrl('./locale', mockLog, {
        dryRun: true,
      }),
    ).toEqual(join(process.cwd(), './locale'));
  });
});
