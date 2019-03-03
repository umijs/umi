import * as assert from 'assert';
import { sync as resolveBin } from 'resolve-bin';
import { fork } from 'child_process';
import { join } from 'path';
import getUserConfig, { CONFIG_FILES } from './getUserConfig';
import registerBabel from './registerBabel';

export default function ({ cmd, params = [] }) {
  assert.ok(
    ['build', 'dev', 'deploy'].includes(cmd),
    `Invalid subCommand ${cmd}`,
  );

  // register babel for config files
  const cwd = process.cwd();
  registerBabel({
    cwd,
    only: CONFIG_FILES,
  });

  const userConfig = getUserConfig({ cwd });
  // console.log(`userConfig`, userConfig);

  return new Promise((resolve, reject) => {
    const binPath = resolveBin('docz');
    if (!params.includes('--config')) {
      params.push('--config', join(__dirname, 'docrc.js'));
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
