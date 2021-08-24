import ncc from '@vercel/ncc';
import { basename, dirname, extname, join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
// import { Package } from 'dts-packer';
import { Package } from '/Users/chencheng/code/github.com/sorrycc/dts-packer/dist/Package.js';
import resolve from 'resolve';

export async function buildDep(opts) {
  console.log(chalk.green(`Build dep ${opts.pkgName || opts.file}`));

  const nodeModulesPath = join(opts.base, 'node_modules');
  const target = join(opts.base, opts.target);

  if (opts.clean) {
    fs.removeSync(target);
  }

  let entry;
  if (opts.pkgName) {
    entry = require.resolve(opts.pkgName, {
      paths: [nodeModulesPath],
    });
  } else {
    entry = join(opts.base, opts.file);
  }

  if (!opts.dtsOnly) {
    const { code, assets } = await ncc(entry, {
      externals: opts.webpackExternals,
      minify: !!opts.minify,
    });

    // assets
    for (const key of Object.keys(assets)) {
      const asset = assets[key];
      const data = asset.source;
      const filePath = join(target, key);
      fs.ensureDirSync(dirname(filePath));
      writeFileSync(join(target, key), data);
    }

    // entry code
    fs.ensureDirSync(target);
    writeFileSync(join(target, 'index.js'), code, 'utf-8');
  }

  // license & package.json
  if (opts.pkgName) {
    fs.ensureDirSync(target);
    const pkgRoot = dirname(
      resolve.sync(`${opts.pkgName}/package.json`, {
        basedir: opts.base,
      }),
    );
    if (existsSync(join(pkgRoot, 'LICENSE'))) {
      writeFileSync(
        join(target, 'LICENSE'),
        readFileSync(join(pkgRoot, 'LICENSE'), 'utf-8'),
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
    } = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf-8'));
    fs.writeJSONSync(join(target, 'package.json'), {
      ...{},
      ...{ name, main: `${basename(main, '.' + extname(main))}` },
      ...(author ? { author } : undefined),
      ...(license ? { license } : undefined),
      ...(types ? { types } : undefined),
      ...(typing ? { typing } : undefined),
    });

    // dts
    new Package({
      cwd: opts.base,
      name: opts.pkgName,
      typesRoot: target,
      externals: opts.dtsExternals,
    });
  }

  // copy files in packages
  if (opts.file && !opts.dtsOnly) {
    const packagesDir = join(opts.base, dirname(opts.file), 'packages');
    if (existsSync(packagesDir)) {
      const files = fs.readdirSync(packagesDir);
      files.forEach((file) => {
        if (file.charAt(0) === '.') return;
        if (!fs.statSync(join(packagesDir, file)).isFile()) return;
        fs.copyFileSync(join(packagesDir, file), join(target, file));
      });
    }
  }
}

const base = process.cwd();
const pkg = fs.readJSONSync(join(base, 'package.json'));
const {
  deps,
  externals,
  noMinify = [],
  extraDtsDeps = [],
} = pkg.compiledConfig;

const webpackExternals = {};
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
    target: `compiled/${isDep ? dep : basename(dirname(dep))}`,
    base,
    webpackExternals,
    dtsExternals,
    clean: argv.clean,
    minify: !noMinify.includes(dep),
    dtsOnly: extraDtsDeps.includes(dep),
  });
}
