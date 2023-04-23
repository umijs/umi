import 'zx/globals';
import { PATHS, SCRIPTS } from './.internal/constants';
import { setExcludeFolder } from './.internal/utils';

(async () => {
  const root = PATHS.ROOT;
  const pkgDir = path.join(root, 'packages');
  const pkgs = await fs.readdir(pkgDir);

  for (const pkg of pkgs) {
    if (pkg.charAt(0) === '.') continue;
    if (!(await fs.stat(path.join(pkgDir, pkg))).isDirectory()) continue;
    await bootstrapPkg({
      pkgDir,
      pkg,
      force: argv.force,
    });
  }

  function getName(pkgName: string) {
    if (['umi'].includes(pkgName)) {
      return pkgName;
    } else {
      return `@umijs/${pkgName}`;
    }
  }

  function getVersion() {
    return require(PATHS.LERNA_CONFIG).version;
  }

  async function bootstrapPkg(opts: any) {
    const pkgDir = path.join(opts.pkgDir, opts.pkg);
    if (!opts.force && fs.existsSync(path.join(pkgDir, 'package.json'))) {
      console.log(`${opts.pkg} exists`);
    } else {
      const name = getName(opts.pkg);

      // package.json
      const pkgPkgJSONPath = path.join(pkgDir, 'package.json');
      const hasPkgJSON = fs.existsSync(pkgPkgJSONPath);
      const pkgPkgJSON = hasPkgJSON ? require(pkgPkgJSONPath) : {};
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
              build: SCRIPTS.BUILD,
              'build:deps': SCRIPTS.BUNDLE_DEPS,
              dev: SCRIPTS.DEV,
            },
            repository: {
              type: 'git',
              url: 'https://github.com/umijs/umi',
            },
            authors: [
              'chencheng <sorrycc@gmail.com> (https://github.com/sorrycc)',
            ],
            license: 'MIT',
            bugs: 'https://github.com/umijs/umi/issues',
            homepage: `https://github.com/umijs/umi/tree/master/packages/${opts.pkg}#readme`,
            publishConfig: {
              access: 'public',
            },
          },
          {
            ...(hasPkgJSON
              ? {
                  authors: pkgPkgJSON.authors,
                  bin: pkgPkgJSON.bin,
                  files: pkgPkgJSON.files,
                  scripts: pkgPkgJSON.scripts,
                  description: pkgPkgJSON.description,
                  dependencies: pkgPkgJSON.dependencies,
                  devDependencies: pkgPkgJSON.devDependencies,
                  compiledConfig: pkgPkgJSON.compiledConfig,
                }
              : {}),
          },
        ),
        { spaces: '  ' },
      );

      // README.md
      await fs.writeFile(
        path.join(pkgDir, 'README.md'),
        `# ${name}\n\nSee our website [umijs](https://umijs.org) for more information.`,
        'utf-8',
      );

      // tsconfig.json
      await fs.writeFile(
        path.join(pkgDir, 'tsconfig.json'),
        `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}\n`,
        'utf-8',
      );

      // .fatherrc.ts
      await fs.writeFile(
        path.join(pkgDir, '.fatherrc.ts'),
        `import { defineConfig } from 'father';

export default defineConfig({
  extends: '../../.fatherrc.base.ts',
});\n`,
        'utf-8',
      );

      // src/index.ts
      const srcDir = path.join(pkgDir, 'src');
      if (!fs.existsSync(srcDir)) {
        await $`mkdir ${srcDir}`;
      }
      if (!fs.existsSync(path.join(pkgDir, 'src', 'index.ts'))) {
        await fs.writeFile(
          path.join(pkgDir, 'src', 'index.ts'),
          `
export default () => {
  return '${name}';
};\n`.trimStart(),
          'utf-8',
        );
        await fs.writeFile(
          path.join(pkgDir, 'src', 'index.test.ts'),
          `
import index from './index';

test('normal', () => {
  expect(index()).toEqual('${name}');
});\n`.trimStart(),
          'utf-8',
        );
      }

      // set excludeFolder for webstorm
      setExcludeFolder({ pkg: opts.pkg, cwd: root });

      console.log(chalk.green(`${opts.pkg} bootstrapped`));
    }
  }
})();
