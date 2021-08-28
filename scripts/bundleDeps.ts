// @ts-ignore
import ncc from '@vercel/ncc';
import resolve from 'resolve';
import { argv, chalk, fs, path } from 'zx';
// import { Package } from 'dts-packer';
// @ts-ignore
import { Package } from '/Users/chencheng/code/github.com/sorrycc/dts-packer/dist/Package.js';

export async function buildDep(opts: any) {
  console.log(chalk.green(`Build dep ${opts.pkgName || opts.file}`));

  const nodeModulesPath = path.join(opts.base, 'node_modules');
  const target = path.join(opts.base, opts.target);

  if (opts.clean) {
    fs.removeSync(target);
  }

  let entry;
  if (opts.pkgName) {
    entry = require.resolve(opts.pkgName, {
      paths: [nodeModulesPath],
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
      const { code, assets } = await ncc(entry, {
        externals: opts.webpackExternals,
        minify: !!opts.minify,
      });

      // assets
      for (const key of Object.keys(assets)) {
        const asset = assets[key];
        const data = asset.source;
        const filePath = path.join(target, key);
        fs.ensureDirSync(path.dirname(filePath));
        fs.writeFileSync(path.join(target, key), data);
      }

      // entry code
      fs.ensureDirSync(target);
      fs.writeFileSync(path.join(target, 'index.js'), code, 'utf-8');
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
      const {
        name,
        main = 'index.js',
        author,
        license,
        types,
        typing,
        typings,
      } = JSON.parse(
        fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf-8'),
      );
      fs.writeJSONSync(path.join(target, 'package.json'), {
        ...{},
        ...{ name, main: `${path.basename(main, '.' + path.extname(main))}` },
        ...(author ? { author } : undefined),
        ...(license ? { license } : undefined),
        ...(types ? { types } : undefined),
        ...(typing ? { typing } : undefined),
        ...(typings ? { typings } : undefined),
      });

      // dts
      new Package({
        cwd: opts.base,
        name: opts.pkgName,
        typesRoot: target,
        externals: opts.dtsExternals,
      });
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

(async () => {
  const base = process.cwd();
  const pkg = fs.readJSONSync(path.join(base, 'package.json'));
  const pkgDeps = pkg.dependencies || {};
  const {
    deps,
    externals,
    noMinify = [],
    extraDtsDeps = [],
  } = pkg.compiledConfig;

  const webpackExternals: Record<string, string> = {};
  const dtsExternals = [...extraDtsDeps];
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
      isDependency: dep in pkgDeps,
    });
  }
})();
