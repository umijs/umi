import { readWantedLockfile } from '@pnpm/lockfile-file';
// @ts-ignore
import ncc from '@vercel/ncc';
import { Package } from 'dts-packer';
import resolve from 'resolve';
import 'zx/globals';
import { PATHS } from './.internal/constants';
// @ts-ignore
// import { Package } from '/Users/chencheng/code/github.com/sorrycc/dts-packer/dist/Package.js';

export async function buildDep(opts: any) {
  console.log(chalk.green(`Build dep ${opts.pkgName || opts.file}`));

  const nodeModulesPath = path.join(opts.base, 'node_modules');
  const target = path.join(opts.base, opts.target);

  if (opts.clean) {
    fs.removeSync(target);
  }

  let entry;
  if (opts.pkgName) {
    let resolvePath = opts.pkgName;
    // mini-css-extract-plugin 用 dist/cjs 为入口会有问题
    if (opts.pkgName === 'mini-css-extract-plugin') {
      resolvePath = 'mini-css-extract-plugin/dist/index';
    }
    entry = resolve.sync(resolvePath, {
      basedir: nodeModulesPath,
    });
  } else {
    entry = path.join(opts.base, opts.file);
  }

  if (!opts.dtsOnly) {
    if (opts.isDependency) {
      fs.ensureDirSync(target);
      fs.writeFileSync(
        path.join(target, 'index.js'),
        `
const exported = require("${opts.pkgName}");
Object.keys(exported).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === exported[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return exported[key];
    }
  });
});
      `.trim() + '\n',
        'utf-8',
      );
    } else {
      const filesToCopy: string[] = [];
      if (opts.file === './bundles/webpack/bundle') {
        delete opts.webpackExternals['webpack'];
      }

      // babel pre rewrite
      if (opts.file === './bundles/babel/bundle') {
        // See https://github.com/umijs/umi/issues/10356
        // The inherited `browserslist` config is dynamic loaded
        const babelCorePkg = require.resolve('@babel/core/package.json', {
          paths: [path.join(PATHS.PACKAGES, './bundler-utils')],
        });
        // And need overrides a consistent version of `browserslist` in `packages.json#pnpm.overrides`
        const browserslistPkg = require.resolve('browserslist/package.json', {
          paths: [path.dirname(babelCorePkg)],
        });
        const nodePartFile = path.join(
          path.dirname(browserslistPkg),
          'node.js',
        );
        const originContent = fs.readFileSync(nodePartFile, 'utf-8');
        // https://github.com/browserslist/browserslist/blob/fc5fc088c640466df62a6b6c86154b19be3de821/node.js#L176
        fs.writeFileSync(
          nodePartFile,
          originContent.replace(
            /require\(require\.resolve/g,
            'eval("require")(require.resolve',
          ),
          'utf-8',
        );
      }

      let { code, assets } = await ncc(entry, {
        externals: opts.webpackExternals,
        minify: !!opts.minify,
        target: 'es5',
        assetBuilds: false,
        customEmit(filePath: string, { id }: any) {
          if (
            (opts.file === './bundles/webpack/bundle' &&
              filePath.endsWith('.runtime.js')) ||
            (opts.pkgName === 'terser-webpack-plugin' &&
              filePath.endsWith('./utils') &&
              id.endsWith('terser-webpack-plugin/dist/index.js')) ||
            (opts.pkgName === 'css-minimizer-webpack-plugin' &&
              filePath.endsWith('./utils') &&
              id.endsWith('css-minimizer-webpack-plugin/dist/index.js'))
          ) {
            filesToCopy.push(
              resolve.sync(filePath, {
                basedir: path.dirname(id),
              }),
            );
            return `'./${path.basename(filePath)}'`;
          }
        },
      });

      // assets
      console.log('filesToCopy', filesToCopy);
      for (const key of Object.keys(assets)) {
        const asset = assets[key];
        const data = asset.source;
        const filePath = path.join(target, key);
        fs.ensureDirSync(path.dirname(filePath));
        fs.writeFileSync(path.join(target, key), data);
      }

      // filesToCopy
      for (const fileToCopy of filesToCopy) {
        let content = fs.readFileSync(fileToCopy, 'utf-8');
        for (const key of Object.keys(opts.webpackExternals)) {
          content = content.replace(
            new RegExp(`require\\\(['"]${key}['"]\\\)`, 'gm'),
            `require('${opts.webpackExternals[key]}')`,
          );
          content = content.replace(
            new RegExp(`require\\\(['"]${key}/package(\.json)?['"]\\\)`, 'gm'),
            `require('${opts.webpackExternals[key]}/package.json')`,
          );
        }
        fs.writeFileSync(
          path.join(target, path.basename(fileToCopy)),
          content,
          'utf-8',
        );
      }

      // entry code
      fs.ensureDirSync(target);
      // node 14 support for chalk
      if (
        [
          'chalk',
          'pkg-up',
          'execa',
          'globby',
          'os-locale',
          'gzip-size',
          'prettier',
          'copy-webpack-plugin',
          'zx',
          '@vitejs/plugin-legacy',
          '@vitejs/plugin-vue',
          '@clack/prompts',
        ].includes(opts.pkgName)
      ) {
        code = code.replace(/require\("node:/g, 'require("');
      }

      // in production, we have the global all `core-js` polyfill (feature/polyfill.ts)
      // don't need the polyfill added by vite
      // https://github.com/vitejs/vite/blob/d953536aae448e2bea0f3a7cb3c0062b16d45597/packages/plugin-legacy/src/index.ts#L257
      if (opts.pkgName === '@vitejs/plugin-legacy') {
        code = code.replace(
          'await detectPolyfills(`Promise.resolve(); Promise.all();`',
          'await (()=>{})(`Promise.resolve(); Promise.all();`',
        );
      }

      if (
        code.includes('"node:') &&
        opts.pkgName && // skip local file bundle like babel/bundle.js
        opts.pkgName !== 'stylelint-declaration-block-no-ignored-properties' &&
        opts.pkgName !== 'vite' &&
        opts.pkgName !== 'https-proxy-agent' &&
        opts.pkgName !== 'socks-proxy-agent'
      ) {
        throw new Error(`${opts.pkgName} has "node:"`);
      }
      // patch less resolve path to umi compiled path
      if (opts.pkgName === 'vite') {
        code = code.replace(
          'loadPreprocessor("less"',
          'loadPreprocessor("@umijs/bundler-utils/compiled/less"',
        );
      }
      fs.writeFileSync(path.join(target, 'index.js'), code, 'utf-8');

      // patch
      if (opts.pkgName === 'mini-css-extract-plugin') {
        fs.copySync(
          path.join(nodeModulesPath, opts.pkgName, 'dist', 'hmr'),
          path.join(target, 'hmr'),
        );
        fs.copyFileSync(
          path.join(nodeModulesPath, opts.pkgName, 'dist', 'utils.js'),
          path.join(target, 'utils.js'),
        );
        fs.copyFileSync(
          path.join(
            nodeModulesPath,
            opts.pkgName,
            'dist',
            'loader-options.json',
          ),
          path.join(target, 'loader-options.json'),
        );
      }
      if (opts.pkgName === 'fork-ts-checker-webpack-plugin') {
        fs.removeSync(path.join(target, 'typescript.js'));
      }

      // for bundler-webpack
      if (opts.pkgName === 'webpack') {
        fs.writeFileSync(
          path.join(opts.base, 'compiled/express.d.ts'),
          `import e = require('@umijs/bundler-utils/compiled/express');\nexport = e;`,
          'utf-8',
        );
      }

      // validate babel dynamic dep version
      if (opts.file === './bundles/babel/bundle') {
        const pkg = require(path.join(opts.base, 'package.json'));

        readWantedLockfile(PATHS.ROOT, {
          ignoreIncompatible: true,
        }).then((lockfile) => {
          const unicodePkgName = 'regenerate-unicode-properties';
          const [, unicodeParentPkg] = Object.entries(lockfile!.packages!).find(
            ([name]) => name.startsWith('/regexpu-core/'),
          )!;

          if (
            unicodeParentPkg.dependencies![unicodePkgName] !==
            pkg.dependencies[unicodePkgName]
          ) {
            throw new Error(`regenerate-unicode-properties is outdated, please update it to ${
              unicodeParentPkg.dependencies![unicodePkgName]
            } in bundler-utils/package.json before update compiled files!
       ref: https://github.com/umijs/umi/pull/7972`);
          }
        });
      }
    }
  }

  // license & package.json
  if (opts.pkgName) {
    if (opts.isDependency) {
      fs.ensureDirSync(target);
      fs.writeFileSync(
        path.join(target, 'index.d.ts'),
        `export * from '${opts.pkgName}';\n`,
        'utf-8',
      );
    } else {
      fs.ensureDirSync(target);
      const pkgRoot = path.dirname(
        resolve.sync(`${opts.pkgName}/package.json`, {
          basedir: opts.base,
        }),
      );
      if (fs.existsSync(path.join(pkgRoot, 'LICENSE'))) {
        fs.writeFileSync(
          path.join(target, 'LICENSE'),
          fs.readFileSync(path.join(pkgRoot, 'LICENSE'), 'utf-8'),
          'utf-8',
        );
      }
      const { name, author, license, types, typing, typings, version } =
        JSON.parse(
          fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf-8'),
        );
      fs.writeJSONSync(path.join(target, 'package.json'), {
        ...{},
        ...{ name },
        ...{ version },
        ...(author ? { author } : undefined),
        ...(license ? { license } : undefined),
        ...(types ? { types } : undefined),
        ...(typing ? { typing } : undefined),
        ...(typings ? { typings } : undefined),
      });

      // dts
      if (opts.noDts) {
        console.log(chalk.yellow(`Do not build dts for ${opts.pkgName}`));
      } else {
        new Package({
          cwd: opts.base,
          name: opts.pkgName,
          typesRoot: target,
          externals: opts.dtsExternals,
        });

        // patch
        if (opts.pkgName === 'webpack-5-chain') {
          const filePath = path.join(target, 'types/index.d.ts');
          fs.writeFileSync(
            filePath,
            fs
              .readFileSync(filePath, 'utf-8')
              .replace(
                `} from 'webpack';`,
                `} from '@umijs/bunder-webpack/compiled/webpack';`,
              ),
            'utf-8',
          );
        }
        if (opts.pkgName === 'lodash') {
          // TODO
          // fs.copySync()
        }

        // for bundler-utils
        if (opts.pkgName === 'less') {
          const dtsPath = path.join(opts.base, 'compiled/less/index.d.ts');

          fs.writeFileSync(
            dtsPath,
            fs
              .readFileSync(dtsPath, 'utf-8')
              .replace(
                'declare module "less"',
                'declare module "@umijs/bundler-utils/compiled/less"',
              ),
            'utf-8',
          );
        }
      }
    }
  }

  // copy files in packages
  if (opts.file && !opts.dtsOnly) {
    const packagesDir = path.join(
      opts.base,
      path.dirname(opts.file),
      'packages',
    );
    if (fs.existsSync(packagesDir)) {
      const files = fs.readdirSync(packagesDir);
      files.forEach((file) => {
        if (file.charAt(0) === '.') return;
        if (!fs.statSync(path.join(packagesDir, file)).isFile()) return;
        fs.copyFileSync(path.join(packagesDir, file), path.join(target, file));
      });
    }
  }
}

/**
 * 编译打包 package.json 文件中 compiledConfig 配置的依赖库
 */
(async () => {
  const base = process.cwd();
  const pkg = fs.readJSONSync(path.join(base, 'package.json'));
  const pkgDeps = pkg.dependencies || {};
  const {
    deps,
    externals = {},
    noMinify = [],
    extraDtsDeps = [],
    extraDtsExternals = [],
    excludeDtsDeps = [],
  } = pkg.compiledConfig;

  const webpackExternals: Record<string, string> = {};
  const dtsExternals = [...extraDtsDeps, ...extraDtsExternals];
  Object.keys(externals).forEach((name) => {
    const val = externals[name];
    if (val === '$$LOCAL') {
      dtsExternals.push(name);
      webpackExternals[name] = `${pkg.name}/compiled/${name}`;
    } else {
      webpackExternals[name] = val;
    }
  });

  for (const dep of argv.dep
    ? [argv.dep]
    : argv['extra-dts-only']
    ? extraDtsDeps
    : deps.concat(extraDtsDeps)) {
    const isDep = dep.charAt(0) !== '.';
    await buildDep({
      ...(isDep ? { pkgName: dep } : { file: dep }),
      target: `compiled/${isDep ? dep : path.basename(path.dirname(dep))}`,
      base,
      webpackExternals,
      dtsExternals,
      clean: argv.clean,
      minify: !noMinify.includes(dep),
      dtsOnly: extraDtsDeps.includes(dep),
      noDts: excludeDtsDeps.includes(dep),
      isDependency: dep in pkgDeps,
    });
  }
})();
