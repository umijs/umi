import { Octokit } from 'octokit';

const GITHUB_TOKEN_FILE = '.github_token';
const OWNER = 'umijs';
const REPO = 'umi';

async function getGitHubToken() {
  const token = fs
    .readFileSync(path.join(__dirname, '../../', GITHUB_TOKEN_FILE), 'utf-8')
    .trim();
  return token;
}

export async function getLatestTag() {
  const token = await getGitHubToken();
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
  const data = response?.data;
  const len = data?.length || 0;
  const latestTag = data[len - 1]?.ref.replace('refs/tags/', '');
  return { latestTag };
}

export async function getReleaseNotes(tagName: string) {
  const token = await getGitHubToken();
  const octokit = new Octokit({
    auth: token,
  });
  const releaseNotesRes = await octokit.request(
    `POST /repos/${OWNER}/${REPO}/releases/generate-notes`,
    {
      tag_name: tagName,
    },
  );
  const releaseNotes = releaseNotesRes?.data?.body;
  return { releaseNotes };
}
