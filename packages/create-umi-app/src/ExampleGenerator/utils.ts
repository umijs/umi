// https://github.com/vercel/next.js/blob/canary/packages/create-next-app/helpers/examples.ts
import { got } from '@umijs/utils';

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
  // https://github.com/:username/:my-cool-umijs-example-repo-name.
  if (t === undefined) {
    const infoResponse = await got(
      `https://api.github.com/repos/${username}/${name}`,
    ).catch((e) => e);
    if (infoResponse.statusCode !== 200) {
      return;
    }
    const info = JSON.parse(infoResponse.body);
    return { username, name, branch: info['default_branch'], filePath };
  }

  // If examplePath is available, the branch name takes the entire path
  const branch = examplePath
    ? `${_branch}/${file.join('/')}`.replace(new RegExp(`/${filePath}|/$`), '')
    : _branch;

  if (username && name && branch && t === 'tree') {
    return { username, name, branch, filePath };
  }
}

export function hasRepo({
  username,
  name,
  branch,
  filePath,
}: RepoInfo): Promise<boolean> {
  const contentsUrl = `https://api.github.com/repos/${username}/${name}/contents`;
  const packagePath = `${filePath ? `/${filePath}` : ''}/package.json`;

  return isUrlOk(contentsUrl + packagePath + `?ref=${branch}`);
}

export function hasExample(name: string): Promise<boolean> {
  return isUrlOk(
    `https://api.github.com/repos/umijs/umi/contents/examples/${encodeURIComponent(
      name,
    )}/package.json`,
  );
}
