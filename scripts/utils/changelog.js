const { htmlEscape } = require('escape-goat');
const git = require('./git');

exports.getChangelog = async () => {
  const repoUrl = 'https://github.com/umijs/umi';
  const latest = await git.latestTagOrFirstCommit();
  const log = await git.commitLogFromRevision(latest);

  if (!log) {
    throw new Error(`get changelog failed, no new commits was found.`);
  }

  const commits = log.split('\n').map(commit => {
    const splitIndex = commit.lastIndexOf(' ');
    return {
      message: commit.slice(0, splitIndex),
      id: commit.slice(splitIndex + 1),
    };
  });

  return nextTag =>
    commits
      .map(commit => `- ${htmlEscape(commit.message)}  ${commit.id}`)
      .join('\n') + `\n\n${repoUrl}/compare/${latest}...${nextTag}`;
};
