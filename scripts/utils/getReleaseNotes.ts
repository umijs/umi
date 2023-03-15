import { Octokit } from 'octokit';

/**
 * @description 获取 Github Release Notes
 * @param tagName tag 名称
 * @returns
 */
export async function getReleaseNotes(tagName: string) {
  const GITHUB_TOKEN_FILE = '.github_token';
  const OWNER = 'MaxCDon';
  const REPO = 'umi';
  const token = fs
    .readFileSync(path.join(__dirname, '../../', GITHUB_TOKEN_FILE), 'utf-8')
    .trim();
  const octokit = new Octokit({
    auth: token,
  });
  const releaseNotesRes = await octokit.request(
    `POST /repos/${OWNER}/${REPO}/releases/generate-notes`,
    {
      tag_name: tagName,
      target_commitish: 'feature/tag_max_20230307',
    },
  );
  const releaseNotes = releaseNotesRes?.data?.body;
  return { releaseNotes };
}
