import * as assert from 'assert';
import { sync as resolveBin } from 'resolve-bin';
import { fork } from 'child_process';
import { join } from 'path';
import { writeFileSync, existsSync } from 'fs';
import { sync as mkdirp } from 'mkdirp';
import ghpages from 'gh-pages';
import chalk from 'chalk';
import { merge } from 'lodash';
import getUserConfig, { CONFIG_FILES } from './getUserConfig';
import registerBabel from './registerBabel';

export function devOrBuild({ cwd, cmd, params, docConfig }) {
  process.chdir(cwd);

  // register babel for config files
  registerBabel({
    cwd,
    only: CONFIG_FILES,
  });

  // get user config and write
  const userConfig = getUserConfig({ cwd });
  userConfig.doc = merge(userConfig.doc || {}, docConfig || {});
  mkdirp(join(cwd, '.docz'));
  writeFileSync(
    join(cwd, '.docz', '.umirc.library.json'),
    JSON.stringify(userConfig, null, 2),
    'utf-8',
  );

  return new Promise((resolve, reject) => {
    const binPath = resolveBin('docz');
    assert.ok(
      !params.includes('--config'),
      `
Don't use --config, config under doc in .umirc.library.js

e.g.

export default {
  doc: {
    themeConfig: { mode: 'dark' },
  },
};
      `.trim(),
    );

    // test 时走 src/doc.ts，这时没有 doczrc.js
    if (__dirname.endsWith('src')) {
      params.push('--config', join(__dirname, '../lib/doczrc.js'));
    } else {
      params.push('--config', join(__dirname, 'doczrc.js'));
    }

    if (!params.includes('--port') && !params.includes('-p')) {
      params.push('--port', '8001');
    }
    if (params.includes('-h')) {
      params.push('--help');
    }
    const child = fork(binPath, [cmd, ...params]);
    child.on('exit', code => {
      if (code === 1) {
        reject(new Error('Doc build failed'));
      } else {
        resolve();
      }
    });
  });
}

export function deploy({ cwd, args }) {
  return new Promise((resolve, reject) => {
    const distDir = join(cwd, '.docz/dist');
    assert.ok(
      existsSync(distDir),
      `Please run ${chalk.green(`umi-lib doc build`)} first`,
    );
    ghpages.publish(distDir, args, err => {
      if (err) {
        reject(new Error(`Doc deploy failed. ${err.message}`));
      } else {
        resolve();
      }
    });
  });
}
