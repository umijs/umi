import { generate, getASTByFilePath, removeConfigByName } from '@umijs/ast';
import prettier from '@umijs/utils/compiled/prettier';
import { writeFileSync } from 'fs';

export function remove(mainConfigFile: string, name: string) {
  const ast = getASTByFilePath(mainConfigFile);
  if (!ast) return;
  const generateCode = generate(removeConfigByName(ast, name));
  const printStr = prettier.format(generateCode, {
    parser: 'typescript',
  });
  writeFileSync(mainConfigFile, printStr, 'utf-8');
  console.log(`remove config:${name} on ${mainConfigFile}`);
}
