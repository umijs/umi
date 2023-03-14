import { Octokit } from 'octokit';

/**
 * @description 获取最新 Git Tag 名
 */
export async function getLatestTag() {
  const GITHUB_TOKEN_FILE = '.github_token';
  const OWNER = 'MaxCDon';
  const REPO = 'umi';
  const token = fs
    .readFileSync(path.join(__dirname, '../../', GITHUB_TOKEN_FILE), 'utf-8')
    .trim();
  const octokit = new Octokit({
    auth: token,
  });
  const response = await octokit.request(
    `GET /repos/${OWNER}/${REPO}/git/refs/tags`,
    {
      owner: OWNER,
      repo: REPO,
    },
  );
  const data = response.data;
  const len = data?.length || 0;
  const latestTag = data[len - 1]?.ref.replace('refs/tags/', '');
  return { latestTag };
}
