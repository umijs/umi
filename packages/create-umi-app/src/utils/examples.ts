import { got, tar } from '@umijs/utils';
import { Stream } from 'stream';
import { promisify } from 'util';

const pipeline = promisify(Stream.pipeline);

export type RepoInfo = {
  username: string;
  name: string;
  branch: string;
  filePath: string;
};

export async function isUrlOk(url: string): Promise<boolean> {
  const res = await got.head(url).catch((e) => e);
  return res.statusCode === 200;
}

export async function getRepoInfo(
  url: URL,
  examplePath?: string,
): Promise<RepoInfo | undefined> {
  const [, username, name, t, _branch, ...file] = url.pathname.split('/');
  const filePath = examplePath
    ? examplePath.replace(/^\//, '')
    : file.join('/');

  // Support repos whose entire purpose is to be a umi example, e.g.
  // https://github.com/:username/:umijs-example-repo-name.
  const infoResponse = await got(
    `https://api.github.com/repos/${username}/${name}`,
  ).catch((e) => {
    throw new Error(e);
  });
  const info = JSON.parse(infoResponse.body);
  return { username, name, branch: info['default_branch'], filePath };
}

export function hasExample(name: string): Promise<boolean> {
  return isUrlOk(
    `https://api.github.com/repos/umijs/umi/contents/examples/${encodeURIComponent(
      name,
    )}/package.json`,
  );
}

export function downloadAndExtractRepo(
  root: string,
  { username, name, branch, filePath }: RepoInfo,
): Promise<void> {
  return pipeline(
    got.stream(
      `https://codeload.github.com/${username}/${name}/tar.gz/${branch}`,
    ),
    tar.extract(
      { cwd: root, strip: filePath ? filePath.split('/').length + 1 : 1 },
      [`${name}-${branch}${filePath ? `/${filePath}` : ''}`],
    ),
  );
}
