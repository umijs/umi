import * as assert from 'assert';
import { sync as resolveBin } from 'resolve-bin';
import { fork } from 'child_process';
import { join } from 'path';
import getUserConfig, { CONFIG_FILES } from './getUserConfig';
import registerBabel from './registerBabel';
import {writeFileSync} from 'fs';

export default function ({ cwd, cmd, params = [] }) {
  assert.ok(
    ['build', 'dev', 'deploy'].includes(cmd),
    `Invalid subCommand ${cmd}`,
  );

  process.chdir(cwd);

  // register babel for config files
  registerBabel({
    cwd,
    only: CONFIG_FILES,
  });

  const userConfig = getUserConfig({ cwd });
  writeFileSync(
    join(cwd, '.docz', '.umirc.library.json'),
    JSON.stringify(userConfig, null, 2),
    'utf-8',
  );

  return new Promise((resolve, reject) => {
    const binPath = resolveBin('docz');
    if (!params.includes('--config')) {
      // test 时在 src 下没有 docrc.js
      if (__dirname.endsWith('src')) {
        params.push('--config', join(__dirname, '../lib/docrc.js'));
      } else {
        params.push('--config', join(__dirname, 'docrc.js'));
      }
    }
    if (!params.includes('--port') && !params.includes('-p')) {
      params.push('--port', '8001');
    }
    if (params.includes('-h')) {
      params.push('--help');
    }
    const child = fork(binPath, [cmd, ...params]);
    child.on('exit', (code) => {
      if (code === 1) {
        reject(new Error('Doc build failed'));
      } else {
        resolve();
      }
    });
  });
}
