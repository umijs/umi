import assert from 'assert';
import fs from 'fs';
import { join } from 'path';
import { compileLess } from './compileLess';

const fixturesDir = join(__dirname, '../../../fixtures');

// 在 jest 下跑会出错，所以只能手动跑来验证了
// test('normal', async () => {
(async () => {
  const filePath = join(fixturesDir, 'overrides/less/index.less');
  const modifyVars = {
    'primary-color': '#1DA57A',
  };
  const alias = {
    barbar: join(filePath, '../node_modules/bar'),
  };
  const result = await compileLess(
    fs.readFileSync(filePath, 'utf-8'),
    filePath,
    modifyVars,
    alias,
  );
  assert(
    result.includes(
      `
.bar {
  color: red;
}
.foo {
  color: red;
}
.a {
  aaa: green;
  bbb: #1DA57A;
}
  `.trim(),
    ),
  );
})().catch((e) => {
  console.error(e);
});
// });
