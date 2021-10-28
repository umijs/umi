import { generate, getASTByFilePath, setConfigByName } from '@umijs/ast';
import { prettier } from '@umijs/utils';
import { writeFileSync } from 'fs';

export function set(mainConfigFile: string, name: string, value: any) {
  const ast = getASTByFilePath(mainConfigFile);
  if (!ast) return;
  const generateCode = generate(setConfigByName(ast, name, value)!);
  const printStr = prettier.format(generateCode, {
    parser: 'typescript',
  });
  writeFileSync(mainConfigFile, printStr, 'utf-8');
  console.log(`set config:${name} on ${mainConfigFile}`);
}
