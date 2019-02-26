import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import rimraf from 'rimraf';
import assert from 'assert';
import signale from 'signale';
import { IOpts } from './types';
import babel from "./babel";

const CONFIG_FILE = '.umirc.library.js';
const DEFAULT_BUNDLE_OPTS = {
  entry: 'src/index.js', // TODO: support jsx, ts and tsx
};

export function getBundleOpts(opts: IOpts) {
  const { cwd, buildArgs = {} } = opts;
  const configFile = join(cwd, CONFIG_FILE);
  if (existsSync(configFile)) {
    return {
      ...DEFAULT_BUNDLE_OPTS,
      ...require(configFile), // eslint-disable-line
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
  const bundleOpts = getBundleOpts(opts);

  // clean
  signale.info(`Clean dist directory`);
  rimraf.sync(join(cwd, 'dist'));

  // build umd
  if (bundleOpts.umd) {
    signale.info(`Build umd`);
  }

  // build cjs
  if (bundleOpts.cjs) {
    signale.info(`Build cjs with ${bundleOpts.cjs.type}`);
    if (bundleOpts.cjs.type === 'babel') {
      await babel({ cwd, watch, type: 'cjs' });
    } else {
      // TODO
    }
  }

  // build esm
  if (bundleOpts.esm) {
    signale.info(`Build esm with ${bundleOpts.esm.type}`);
    if (bundleOpts.cjs.type === 'babel') {
      await babel({ cwd, watch, type: 'esm' });
    } else {
      // TODO
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
