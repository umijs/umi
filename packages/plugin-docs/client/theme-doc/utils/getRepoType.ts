export default function getRepoType(repoUrl: string): string {
  if (repoUrl.includes('github.com/')) {
    return 'github';
  } else if (repoUrl.includes('gitlab.com/')) {
    return 'gitlab';
  } else if (repoUrl.includes('gitee.com/')) {
    return 'gitee';
  } else {
    return 'unknown';
  }
}
