import { execa } from '@umijs/utils/compiled/execa';

export interface ArticleContributor {
  username: string;
  email: string;
  commitCount: number;
}

export async function getCreatedTime(
  cwd: string,
  filePath: string,
): Promise<number> {
  const { stdout } = await execa(
    'git',
    ['--no-pager', 'log', '--diff-filter=A', '--format=%at', filePath],
    {
      cwd,
    },
  );

  return parseInt(stdout);
}

export async function getUpdatedTime(
  cwd: string,
  filePath: string,
): Promise<number> {
  const { stdout } = await execa(
    'git',
    ['--no-pager', 'log', '-1', '--format=%at', filePath],
    {
      cwd,
    },
  );

  return parseInt(stdout);
}

export async function getContributors(
  cwd: string,
  filePath: string,
): Promise<ArticleContributor[]> {
  const { stdout } = await execa(
    'git',
    ['--no-pager', 'shortlog', '-nes', 'HEAD', '--', filePath],
    {
      cwd,
    },
  );

  return (
    stdout
      .split('\n')
      // @ts-ignore
      .map((contributor) => contributor.trim().match(/^(\d+)\t(.*) <(.*)>$/))
      .filter(
        // @ts-ignore
        (contributor): contributor is RegExpMatchArray => contributor !== null,
      )
      // @ts-ignore
      .map(([, commitCount, username, email]) => ({
        username,
        email,
        commitCount: parseInt(commitCount),
      }))
  );
}
