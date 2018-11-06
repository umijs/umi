import { isGitUrl, isGitSiteUrl, parseGitSiteUrl } from './download';

describe('test block download utils', () => {
  it('isGitUrl', () => {
    expect(isGitUrl('git@gitlab.alitest-inc.com:bigfish/bigfish.git')).toEqual(
      true,
    );
    expect(
      isGitUrl('http://gitlab.alitest-inc.com/bigfish/bigfish.git'),
    ).toEqual(true);
    expect(isGitUrl('git@github.com:umijs/umi.git')).toEqual(true);
    expect(isGitUrl('https://github.com/umijs/umi.git')).toEqual(true);
    expect(isGitUrl('https://github.com/umijs/umi-blocks')).toEqual(false);
    expect(
      isGitUrl('https://github.com/umijs/umi-blocks/tree/master/demo'),
    ).toEqual(false);
  });

  it('isGitSiteUrl', () => {
    expect(isGitSiteUrl('test-block')).toEqual(false);
    expect(
      isGitSiteUrl('git@gitlab.alitest-inc.com:bigfish/bigfish.git'),
    ).toEqual(false);
    expect(isGitSiteUrl('https://github.com/umijs/umi-blocks')).toEqual(true);
    expect(
      isGitSiteUrl('https://github.com/umijs/umi-blocks/tree/master/demo'),
    ).toEqual(true);
    expect(
      isGitSiteUrl(
        'http://gitlab.alitest-inc.com/bigfish/bigfish-blocks/tree/master/demo',
      ),
    ).toEqual(true);
  });

  it('parseGitSiteUrl', () => {
    expect(
      parseGitSiteUrl('https://github.com/umijs/umi-blocks/tree/master/demo'),
    ).toEqual({
      repo: 'https://github.com/umijs/umi-blocks.git',
      branch: 'master',
      path: '/demo',
    });
    expect(
      parseGitSiteUrl(
        'http://gitlab.alitest-inc.com/bigfish/bigfish-blocks/tree/1.x/demo/test',
      ),
    ).toEqual({
      repo: 'http://gitlab.alitest-inc.com/bigfish/bigfish-blocks.git',
      branch: '1.x',
      path: '/demo/test',
    });
    expect(
      parseGitSiteUrl('http://gitlab.alitest-inc.com/bigfish/hello'),
    ).toEqual({
      repo: 'http://gitlab.alitest-inc.com/bigfish/hello.git',
      branch: 'master',
      path: '/',
    });
    expect(parseGitSiteUrl('https://github.com/umijs/umi-blocks')).toEqual({
      repo: 'https://github.com/umijs/umi-blocks.git',
      branch: 'master',
      path: '/',
    });
  });
});
