import { join } from 'path';
import { fork } from 'child_process';
import { existsSync, readdirSync } from 'fs';

const fixtures = join(__dirname, 'fixtures');
let dirs = readdirSync(fixtures).filter(dir => dir.charAt(0) !== '.');
const testOnly = dirs.some(dir => /-only/.test(dir));
if (testOnly) {
  dirs = dirs.filter(dir => /-only/.test(dir));
}
dirs = dirs.filter(dir => !/^x-/.test(dir));

async function umiBuild(cwd) {
  return new Promise((resolve, reject) => {
    const umiPath = require('umi/bin/umi');
    const env = {
      COMPRESS: 'none',
      PROGRESS: 'none',
      COVERAGE: 1,
    };
    const child = fork(umiPath, ['build'], {
      cwd,
      env,
    });
    child.on('exit', code => {
      if (code === 1) {
        reject(new Error('Build failed'));
      } else {
        resolve();
      }
    });
  });
}

describe('build fixtures', () => {
  require('test-build-result')({
    root: join(__dirname, './fixtures'),
    build: async ({ cwd, dir }) => {
      await umiBuild(cwd);
    },
  });
});
