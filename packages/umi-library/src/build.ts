import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import rimraf from 'rimraf';
import assert from 'assert';
import signale from 'signale';
import { IOpts, IBundleOptions } from './types';
import babel from './babel';
import rollup from './rollup';
import registerBabel from "./registerBabel";

const DEFAULT_BUNDLE_OPTS = {
  entry: 'src/index.js', // TODO: support jsx, ts and tsx
};
const CONFIG_FILES = [
  '.umirc.library.js',
  '.umirc.library.jsx',
  '.umirc.library.ts',
  '.umirc.library.tsx',
];

function testDefault(obj) {
  return obj.default || obj;
}

function getConfigFile(cwd) {
  for (const file of CONFIG_FILES) {
    const configFile = join(cwd, file);
    if (existsSync(configFile)) {
      return configFile;
    }
  }
}

export function getBundleOpts(opts: IOpts): IBundleOptions {
  const { cwd, buildArgs = {} } = opts;
  const configFile = getConfigFile(cwd);
  if (existsSync(configFile)) {
    return {
      ...DEFAULT_BUNDLE_OPTS,
      ...testDefault(require(configFile)), // eslint-disable-line
      ...buildArgs,
    };
  } else {
    return {
      ...DEFAULT_BUNDLE_OPTS,
      ...buildArgs,
    };
  }
}

export async function build(opts: IOpts) {
  const { cwd, watch } = opts;

  // register babel for config files
  registerBabel({
    cwd,
    only: CONFIG_FILES,
  });

  // Get user config
  const bundleOpts = getBundleOpts(opts);

  // Clean dist
  signale.info(`Clean dist directory`);
  rimraf.sync(join(cwd, 'dist'));

  // Build umd
  if (bundleOpts.umd) {
    signale.info(`Build umd`);
    await rollup({
      cwd,
      type: 'umd',
      entry: bundleOpts.entry,
      watch,
    });
  }

  // Build cjs
  if (bundleOpts.cjs) {
    signale.info(`Build cjs with ${bundleOpts.cjs.type}`);
    if (bundleOpts.cjs.type === 'babel') {
      await babel({ cwd, watch, type: 'cjs' });
    } else {
      await rollup({
        cwd,
        type: 'cjs',
        entry: bundleOpts.entry,
        watch,
      });
    }
  }

  // Build esm
  if (bundleOpts.esm) {
    signale.info(`Build esm with ${bundleOpts.esm.type}`);
    if (bundleOpts.cjs && bundleOpts.cjs.type === 'babel') {
      await babel({ cwd, watch, type: 'esm' });
    } else {
      await rollup({
        cwd,
        type: 'esm',
        entry: bundleOpts.entry,
        watch,
      });
    }
  }
}

export async function buildForLerna(opts: IOpts) {
  const pkgs = readdirSync(join(opts.cwd, 'packages'));
  for (const pkg of pkgs) {
    const pkgPath = join(opts.cwd, 'packages', pkg);
    assert(
      existsSync(join(pkgPath, 'package.json')),
      `package.json not found in packages/${pkg}`,
    );
    await build({  // eslint-disable-line
      ...opts,
      cwd: pkgPath,
    });
  }
}

export default async function (opts: IOpts) {
  const useLerna = existsSync(join(opts.cwd, 'lerna.json'));
  if (useLerna && process.env.LERNA !== 'none') {
    await buildForLerna(opts);
  } else {
    await build(opts);
  }
}
