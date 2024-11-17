import 'zx/globals';

(async () => {
  let pkgName = '@umijs/bundler-mako';
  let version = await (async () => {
    if (argv.version) return argv.version;
    let version = (await $`npm show ${pkgName} version`).stdout.trim();
    return version;
  })();
  console.log(`Syncing ${pkgName}@${version}...`);

  let pkgPath = 'packages/preset-umi/package.json';
  let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.dependencies[pkgName] = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  console.log(`Updated ${pkgPath}`);

  await $`pnpm install`;
  console.log(`Installed with pnpm`);

  await $`git commit -am "dep(@umijs/preset-umi): ${pkgName}@${version}"`;
  await $`git push`;
})().catch(e => {
  console.error(e);
  process.exit(1);
});
