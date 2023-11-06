import assert from 'assert';
import getGitRepoInfo from 'git-repo-info';
import 'zx/globals';

(async () => {
  const { branch } = getGitRepoInfo();
  const pkgName = argv.pkg;
  assert(pkgName, `pkg name is required, specify with --pkg=xxx`);
  const pkgPath = path.join(__dirname, '..', pkgName);
  assert(fs.existsSync(pkgPath), `pkg ${pkgName} not exists`);
  try {
    await $`cd ${pkgPath} && npm run build`;
  } catch (e) {
    await $`cd ${pkgPath} && npm run ui:build`;
  }
  await $`cd ${pkgPath} && npm version patch`;
  const newVersion = require(path.join(pkgPath, 'package.json')).version;
  await $`cd ${pkgPath} && pnpm publish --no-git-checks`;

  // commit and tag and push
  await $`git commit -am "release: ${pkgName}@${newVersion}"`;
  await $`git tag ${pkgName}@${newVersion}`;
  await $`git push origin ${branch} --tags`;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
