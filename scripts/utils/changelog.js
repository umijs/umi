const { htmlEscape } = require('escape-goat');
const git = require('./git');

exports.getChangelog = async () => {
  const repoUrl = 'https://github.com/umijs/umi';
  const latest = await git.latestTagOrFirstCommit();
  const log = await git.commitLogFromRevision(latest);

  if (!log) {
    return {
      hasCommits: false,
      releaseNotes: () => {},
    };
  }

  const commits = log.split('\n').map(commit => {
    const splitIndex = commit.lastIndexOf(' ');
    return {
      message: commit.slice(0, splitIndex),
      id: commit.slice(splitIndex + 1),
    };
  });

  const releaseNotes = nextTag =>
    commits
      .map(commit => `- ${htmlEscape(commit.message)}  ${commit.id}`)
      .join('\n') + `\n\n${repoUrl}/compare/${latest}...${nextTag}`;

  return releaseNotes;
};

exports
  .getChangelog()
  .then(releaseNotes => {
    console.log(releaseNotes('v123'));
  })
  .catch(e => {
    console.error(e);
  });
