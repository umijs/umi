import { generate, getASTByFilePath, setConfigByName } from '@umijs/ast';
import { writeFileSync } from 'fs';

export function set(mainConfigFile: string, name: string, value: any) {
  const ast = getASTByFilePath(mainConfigFile);
  if (!ast) return;
  const generateCode = generate(setConfigByName(ast, name, value)!);
  writeFileSync(mainConfigFile, generateCode, 'utf-8');
  console.log(`set config:${name} on ${mainConfigFile}`);
}
