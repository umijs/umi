const { join } = require('path');
const { readFileSync, writeFileSync } = require('fs');

const filePath = join(__dirname, '../packages/umi/lib/defineConfig.d.ts');

const content = readFileSync(filePath, 'utf-8');
const toReplace = `import { IConfigFromPlugins } from '@@/core/pluginConfig';`;
const tsIgnore = `// @ts-ignore`;

if (content.indexOf(toReplace) === -1) {
  throw new Error('ts ignore add failed since target not found.');
}
writeFileSync(
  filePath,
  content.replace(toReplace, `${tsIgnore}\n${toReplace}`),
  'utf-8',
);
