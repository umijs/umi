import {
  isGitUrl,
  isGitSiteUrl,
  isNpmPackage,
  parseGitSiteUrl,
} from './download';

describe('test material download utils', () => {
  it('isNpmPackage', () => {
    expect(isNpmPackage('test-material')).toEqual(true);
    expect(isNpmPackage('@umi-materail/test-material')).toEqual(true);
    expect(isNpmPackage('@alitest/bigfis-material/test-m')).toEqual(true);
    expect(
      isNpmPackage('https://github.com/umijs/umi-materials/tree/master/demo'),
    ).toEqual(false);
  });

  it('isGitUrl', () => {
    expect(isGitUrl('git@gitlab.alitest-inc.com:bigfish/bigfish.git')).toEqual(
      true,
    );
    expect(
      isGitUrl('http://gitlab.alitest-inc.com/bigfish/bigfish.git'),
    ).toEqual(true);
    expect(isGitUrl('git@github.com:umijs/umi.git')).toEqual(true);
    expect(isGitUrl('https://github.com/umijs/umi.git')).toEqual(true);
    expect(isGitUrl('https://github.com/umijs/umi-materials')).toEqual(false);
    expect(
      isGitUrl('https://github.com/umijs/umi-materials/tree/master/demo'),
    ).toEqual(false);
  });

  it('isGitSiteUrl', () => {
    expect(isGitSiteUrl('test-material')).toEqual(false);
    expect(
      isGitSiteUrl('git@gitlab.alitest-inc.com:bigfish/bigfish.git'),
    ).toEqual(false);
    expect(isGitSiteUrl('https://github.com/umijs/umi-materials')).toEqual(
      true,
    );
    expect(
      isGitSiteUrl('https://github.com/umijs/umi-materials/tree/master/demo'),
    ).toEqual(true);
    expect(
      isGitSiteUrl(
        'http://gitlab.alitest-inc.com/bigfish/bigfish-materials/tree/master/demo',
      ),
    ).toEqual(true);
  });

  it('parseGitSiteUrl', () => {
    expect(
      parseGitSiteUrl(
        'https://github.com/umijs/umi-materials/tree/master/demo',
      ),
    ).toEqual({
      repo: 'https://github.com/umijs/umi-materials.git',
      branch: 'master',
      path: '/demo',
    });
    expect(
      parseGitSiteUrl(
        'http://gitlab.alitest-inc.com/bigfish/bigfish-materials/tree/1.x/demo/test',
      ),
    ).toEqual({
      repo: 'http://gitlab.alitest-inc.com/bigfish/bigfish-materials.git',
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
    expect(parseGitSiteUrl('https://github.com/umijs/umi-materials')).toEqual({
      repo: 'https://github.com/umijs/umi-materials.git',
      branch: 'master',
      path: '/',
    });
  });
});
