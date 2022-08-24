import { logger, rimraf } from '@umijs/utils';
import assert from 'assert';
import 'zx/globals';

const fixtureDir = path.join(__dirname, '../codemod/fixtures');
const tmpDir = path.join(fixtureDir, 'tmp');

(async () => {
  // 1、copy fixtures/origin > fixtures/tmp
  logger.info('copy fixtures/origin > fixtures/tmp');
  rimraf.sync(tmpDir);
  fs.copySync(path.join(fixtureDir, 'origin'), tmpDir);

  // 2、run codemod script
  logger.info('run codemod script');
  // enable color for kleur
  // ref: https://github.com/lukeed/kleur/blob/86a7db8/index.mjs#L5
  process.env.FORCE_COLOR = '1';
  await $`npm run codemod:run`;

  // 3、test
  assert(
    getContent('src/useRouteMatch.ts').includes(`useMatch as useRouteMatch`),
    `src/useRouteMatch.ts`,
  );
  assert(
    getContent('.eslintrc.js').includes(`require.resolve('umi/eslint')`) &&
      getContent('.eslintrc.js').includes(
        `"@typescript-eslint/naming-convention": 0`,
      ),
    `.eslintrc.js`,
  );
})();

function getContent(filePath: string) {
  return fs.readFileSync(path.join(tmpDir, filePath), 'utf-8');
}
