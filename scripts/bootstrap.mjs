import { join } from 'path';

const root = join(__dirname, '..');
const pkgDir = join(root, 'packages');
const pkgs = await fs.readdir(pkgDir);

for (const pkg of pkgs) {
  if (pkg.charAt(0) === '.') continue;
  if (!(await fs.stat(join(pkgDir, pkg))).isDirectory()) continue;
  await bootstrapPkg({
    pkgDir,
    pkg,
    force: argv.force,
  });
}

function getName(pkgName) {
  if (['umi'].includes(pkgName)) {
    return pkgName;
  } else {
    return `@umijs/${pkgName}`;
  }
}

function getVersion() {
  return require('../package.json').version;
}

function setExcludeFolder(opts) {
  if (!fs.existsSync(join(root, '.idea'))) return;
  const configPath = join(root, '.idea', 'umi-next.iml');
  let content = fs.readFileSync(configPath, 'utf-8');
  const folders = ['dist', 'compiled'];
  for (const folder of folders) {
    console.log('test', folder);
    const excludeContent = `<excludeFolder url='file://$MODULE_DIR$/packages/${opts.pkg}/${folder}' />`;
    const replaceMatcher = `<content url="file://$MODULE_DIR$">`;
    if (!content.includes(excludeContent)) {
      content = content.replace(
        replaceMatcher,
        `${replaceMatcher}\n      ${excludeContent}`,
      );
    }
  }
  fs.writeFileSync(configPath, content, 'utf-8');
}

async function bootstrapPkg(opts) {
  const pkgDir = join(opts.pkgDir, opts.pkg);
  if (!opts.force && fs.existsSync(join(pkgDir, 'package.json'))) {
    console.log(`${opts.pkg} exists`);
  } else {
    const name = getName(opts.pkg);

    // package.json
    const pkgPkgJSONPath = join(pkgDir, 'package.json');
    const pkgPkgJSON = fs.existsSync(pkgPkgJSONPath)
      ? require(pkgPkgJSONPath)
      : {};
    fs.writeJSONSync(
      pkgPkgJSONPath,

      Object.assign(
        {
          name,
          version: getVersion(),
          description: name,
          main: 'dist/index.js',
          types: 'dist/index.d.ts',
          files: ['dist'],
          scripts: {
            build: 'rimraf dist && tsup src/index.ts --dts --format cjs',
            dev: 'npm run build -- --watch',
          },
          repository: {
            type: 'git',
            url: 'https://github.com/umijs/umi-next',
          },
          authors: [
            'chencheng <sorrycc@gmail.com> (https://github.com/sorrycc)',
          ],
          license: 'MIT',
          bugs: 'http://github.com/umijs/umi-next/issues',
          homepage: `https://github.com/umijs/umi-next/tree/master/packages/${opts.pkg}#readme`,
          publishConfig: {
            access: 'public',
          },
        },
        {
          authors: pkgPkgJSON.authors,
          files: pkgPkgJSON.files,
          scripts: pkgPkgJSON.scripts,
          description: pkgPkgJSON.description,
          dependencies: pkgPkgJSON.dependencies,
          devDependencies: pkgPkgJSON.devDependencies,
          compiledConfig: pkgPkgJSON.compiledConfig,
        },
      ),
      { spaces: '  ' },
    );

    // README.md
    await fs.writeFile(join(pkgDir, 'README.md'), `# ${name}\n`, 'utf-8');

    // src/index.ts
    const srcDir = join(pkgDir, 'src');
    if (!fs.existsSync(srcDir)) {
      await $`mkdir ${srcDir}`;
    }
    await fs.writeFile(
      join(pkgDir, 'src', 'index.ts'),
      `
export default () => {
  return '${name}';
};\n`.trimLeft(),
      'utf-8',
    );
    await fs.writeFile(
      join(pkgDir, 'src', 'index.test.ts'),
      `
import index from './index';

test('normal', () => {
  expect(index()).toEqual('${name}');
});\n`.trimLeft(),
      'utf-8',
    );

    // set excludeFolder for webstorm
    setExcludeFolder({ pkg: opts.pkg });

    console.log(chalk.green(`${opts.pkg} bootstraped`));
  }
}
