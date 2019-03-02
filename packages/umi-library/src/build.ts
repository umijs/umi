import { existsSync, readdirSync, readFileSync } from 'fs';
import {join, relative} from 'path';
import rimraf from 'rimraf';
import * as assert from 'assert';
import { merge } from 'lodash';
import signale from 'signale';
import AJV from 'ajv';
import slash from 'slash2';
import { IOpts, IBundleOptions } from './types';
import babel from './babel';
import rollup from './rollup';
import registerBabel from "./registerBabel";
import schema from "./schema";

const CONFIG_FILES = [
  '.umirc.library.js',
  '.umirc.library.jsx',
  '.umirc.library.ts',
  '.umirc.library.tsx',
];

function testDefault(obj) {
  return obj.default || obj;
}

function getExistFile({ cwd, files, returnRelative }) {
  for (const file of files) {
    const absFilePath = join(cwd, file);
    if (existsSync(absFilePath)) {
      return returnRelative ? file : absFilePath;
    }
  }
}

export function getBundleOpts(opts: IOpts): IBundleOptions {
  const { cwd, buildArgs = {} } = opts;
  const configFile = getExistFile({
    cwd,
    files: CONFIG_FILES,
    returnRelative: false,
  });
  const entry = getExistFile({
    cwd,
    files: [
      'src/index.tsx',
      'src/index.ts',
      'src/index.jsx',
      'src/index.js',
    ],
    returnRelative: true,
  });
  if (existsSync(configFile)) {
    const userConfig = testDefault(require(configFile)); // eslint-disable-line
    const ajv = new AJV({ allErrors: true });
    const isValid = ajv.validate(schema, userConfig);
    if (!isValid) {
      const errors = ajv.errors.map(({ dataPath, message }, index) => {
        return `${index + 1}. ${dataPath}${dataPath ? ' ' : ''}${message}`;
      });
      throw new Error(`
Invalid options in ${slash(relative(cwd, configFile))}

${errors.join('\n')}
`.trim());
    }
    return merge({
      entry,
    }, userConfig, buildArgs);
  } else {
    return merge({
      entry,
    }, buildArgs);
  }
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

export async function build(opts: IOpts) {
  const { cwd, watch } = opts;

  // register babel for config files
  registerBabel({
    cwd,
    only: CONFIG_FILES,
  });

  // Get user config
  const bundleOpts = getBundleOpts(opts);
  validateBundleOpts(bundleOpts, { cwd });

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
      bundleOpts,
    });
  }

  // Build cjs
  if (bundleOpts.cjs) {
    signale.info(`Build cjs with ${bundleOpts.cjs.type}`);
    if (bundleOpts.cjs.type === 'babel') {
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
    signale.info(`Build esm with ${bundleOpts.esm.type}`);
    if (bundleOpts.esm && bundleOpts.esm.type === 'babel') {
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
  const pkgs = readdirSync(join(opts.cwd, 'packages'));
  for (const pkg of pkgs) {
    const pkgPath = join(opts.cwd, 'packages', pkg);
    assert.ok(
      existsSync(join(pkgPath, 'package.json')),
      `package.json not found in packages/${pkg}`,
    );
    process.chdir(pkgPath);
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
