import fs from 'fs';
import { join } from 'path';
import { compileLess } from './compileLess';

const fixturesDir = join(__dirname, '../../../fixtures');

const run = async () => {
  const filePath = join(fixturesDir, 'overrides/less/index.less');
  const targetPath = join(fixturesDir, 'overrides/less/output/index.css');
  const modifyVars = {
    'primary-color': '#1DA57A',
  };
  const alias = {
    barbar: join(filePath, '../node_modules/bar'),
  };
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = await compileLess({
    lessContent: content,
    filePath,
    modifyVars,
    alias,
    targetPath,
  });
  const expectContained = `
.bar {
  color: red;
}
.foo {
  color: red;
}
.img {
  background: url('../assets/img.png');
}
.a {
  aaa: green;
  bbb: #1DA57A;
}
.img {
  border-image: url('../assets/img.png');
}
`.trim();
  if (!result.includes(expectContained)) {
    throw new Error(
      `result not contains the expect content, result: ${result}`,
    );
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
