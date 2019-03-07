import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import rimraf from 'rimraf';
import * as assert from 'assert';
import { merge } from 'lodash';
import signale from 'signale';
import { IOpts, IBundleOptions, IBundleTypeOutput, IEsm } from './types';
import babel from './babel';
import rollup from './rollup';
import registerBabel from './registerBabel';
import { getExistFile } from './utils';
import getUserConfig, { CONFIG_FILES } from './getUserConfig';

export function getBundleOpts(opts: IOpts): IBundleOptions {
  const { cwd, buildArgs = {} } = opts;
  const entry = getExistFile({
    cwd,
    files: ['src/index.tsx', 'src/index.ts', 'src/index.jsx', 'src/index.js'],
    returnRelative: true,
  });
  const userConfig = getUserConfig({ cwd });
  const bundleOpts = merge(
    {
      entry,
    },
    userConfig,
    buildArgs,
  );

  // Support config esm: 'rollup' and cjs: 'rollup'
  if (typeof bundleOpts.esm === 'string') {
    bundleOpts.esm = { type: bundleOpts.esm };
  }
  if (typeof bundleOpts.cjs === 'string') {
    bundleOpts.cjs = { type: bundleOpts.cjs };
  }

  return bundleOpts;
}

function validateBundleOpts(bundleOpts: IBundleOptions, { cwd }) {
  if (bundleOpts.runtimeHelpers) {
    const pkgPath = join(cwd, 'package.json');
    assert.ok(
      existsSync(pkgPath),
      `@babel/runtime dependency is required to use runtimeHelpers`,
    );
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    assert.ok(
      (pkg.dependencies || {})['@babel/runtime'],
      `@babel/runtime dependency is required to use runtimeHelpers`,
    );
  }
}

interface IExtraBuildOpts {
  pkg?: string;
}

export async function build(opts: IOpts, extraOpts: IExtraBuildOpts = {}) {
  const { cwd, watch } = opts;
  const { pkg } = extraOpts;

  // register babel for config files
  registerBabel({
    cwd,
    only: CONFIG_FILES,
  });

  function log(msg) {
    signale.info(`${pkg ? `[${pkg}] ` : ''}${msg}`);
  }

  // Get user config
  const bundleOpts = getBundleOpts(opts);
  validateBundleOpts(bundleOpts, { cwd });

  // Clean dist
  log(`Clean dist directory`);
  rimraf.sync(join(cwd, 'dist'));

  // Build umd
  if (bundleOpts.umd) {
    log(`Build umd`);
    await rollup({
      cwd,
      type: 'umd',
      entry: bundleOpts.entry,
      watch,
      bundleOpts,
    });
  }

  // Build cjs
  if (bundleOpts.cjs) {
    const cjs = bundleOpts.cjs as IBundleTypeOutput;
    log(`Build cjs with ${cjs.type}`);
    if (cjs.type === 'babel') {
      await babel({ cwd, watch, type: 'cjs', bundleOpts });
    } else {
      await rollup({
        cwd,
        type: 'cjs',
        entry: bundleOpts.entry,
        watch,
        bundleOpts,
      });
    }
  }

  // Build esm
  if (bundleOpts.esm) {
    const esm = bundleOpts.esm as IEsm;
    log(`Build esm with ${esm.type}`);
    if (esm && esm.type === 'babel') {
      await babel({ cwd, watch, type: 'esm', bundleOpts });
    } else {
      await rollup({
        cwd,
        type: 'esm',
        entry: bundleOpts.entry,
        watch,
        bundleOpts,
      });
    }
  }
}

export async function buildForLerna(opts: IOpts) {
  const { cwd } = opts;

  // register babel for config files
  registerBabel({
    cwd,
    only: CONFIG_FILES,
  });

  const userConfig = getUserConfig({ cwd });

  const pkgs = readdirSync(join(opts.cwd, 'packages'));
  for (const pkg of pkgs) {
    const pkgPath = join(opts.cwd, 'packages', pkg);
    assert.ok(
      existsSync(join(pkgPath, 'package.json')),
      `package.json not found in packages/${pkg}`,
    );
    process.chdir(pkgPath);
    await build(
      {
        // eslint-disable-line
        ...opts,
        buildArgs: merge(opts.buildArgs, userConfig),
        cwd: pkgPath,
      },
      {
        pkg,
      },
    );
  }
}

export default async function(opts: IOpts) {
  const useLerna = existsSync(join(opts.cwd, 'lerna.json'));
  if (useLerna && process.env.LERNA !== 'none') {
    await buildForLerna(opts);
  } else {
    await build(opts);
  }
}
