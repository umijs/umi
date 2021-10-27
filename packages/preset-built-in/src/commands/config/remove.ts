import { generate, getASTByFilePath, removeConfigByName } from '@umijs/ast';
import { writeFileSync } from 'fs';

export function remove(mainConfigFile: string, name: string) {
  const ast = getASTByFilePath(mainConfigFile);
  if (!ast) return;
  const generateCode = generate(removeConfigByName(ast, name));
  writeFileSync(mainConfigFile, generateCode, 'utf-8');
  console.log(`remove config:${name} on ${mainConfigFile}`);
}
