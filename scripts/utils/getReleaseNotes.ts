import { Octokit } from 'octokit';

export async function getReleaseNotes(version: string) {
  const GITHUB_TOKEN_FILE = '.github_token';
  const OWNER = 'umijs';
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
      tag_name: `v${version}`,
    },
  );
  const releaseNotes = releaseNotesRes.data.body;
  return { releaseNotes };
}
