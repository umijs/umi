import { join } from 'path';
import { fork } from 'child_process';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'fs';

const binPath = join(__dirname, '../bin/umi-library.js');

function assertDocz(cwd) {
  const absDirPath = join(cwd, '.docz/dist');
  const targetPath = join(cwd, 'dist/docz');

  if (existsSync(absDirPath)) {
    renameSync(absDirPath, targetPath);
    const assetsJSONPath = join(targetPath, 'assets.json');
    const json = JSON.parse(readFileSync(assetsJSONPath, 'utf-8'));
    const sortedJSON = Object.keys(json)
      .sort()
      .reduce((memo, key) => {
        return {
          ...memo,
          [key]: json[key],
        };
      }, {});
    writeFileSync(assetsJSONPath, JSON.stringify(sortedJSON, null, 2), 'utf-8');
  } else {
    throw new Error(`.docz/dist not exists`);
  }
}

describe('umi-library doc build', () => {
  process.env.COMPRESS = 'none';
  process.env.IS_TEST = 'true';

  require('test-build-result')({
    root: join(__dirname, './fixtures/e2e'),
    build({ cwd }) {
      return new Promise(resolve => {
        const child = fork(binPath, ['doc', 'build'], {
          cwd,
          env: process.env,
        });
        child.on('exit', code => {
          expect(code).toEqual(0);
          const child = fork(binPath, ['build', '--esm'], {
            cwd,
          });
          child.on('exit', code => {
            expect(code).toEqual(0);
            assertDocz(cwd);
            resolve();
          });
        });
      });
    },
    replaceContent(content) {
      return content
        .replace(
          /\/\*! ModuleConcatenation bailout:[^\n]+/g,
          '/*! $ModuleConcatenation bailout$',
        )
        .replace(/var imports=\{[^\n]+/g, '$imports$');
    },
  });
});
