const { yParser, execa, chalk } = require('@umijs/utils');

exports.latestTag = async () => {
  const { stdout } = await execa('git', ['describe', '--abbrev=0', '--tags']);
  return stdout;
};

const firstCommit = async () => {
  const { stdout } = await execa('git', [
    'rev-list',
    '--max-parents=0',
    'HEAD',
  ]);
  return stdout;
};

exports.latestTagOrFirstCommit = async () => {
  let latest;
  try {
    // In case a previous tag exists, we use it to compare the current repo status to.
    latest = await exports.latestTag();
  } catch (_) {
    // Otherwise, we fallback to using the first commit for comparison.
    latest = await firstCommit();
  }

  return latest;
};

exports.commitLogFromRevision = async revision => {
  const { stdout } = await execa('git', [
    'log',
    '--format=%s %h',
    `${revision}..HEAD`,
  ]);
  return stdout;
};
