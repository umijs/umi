import { getASTByFilePath, setConfigByName } from '@umijs/ast';
import { generate } from '@umijs/ast/dist/utils/generate';
import { writeFileSync } from 'fs';

const set = async (mainConfigFile: string, name: string, value: any) => {
  const ast = getASTByFilePath(mainConfigFile);
  if (!ast) return;
  const generateCode = generate(setConfigByName(ast, name, value)!);
  await writeFileSync(mainConfigFile, generateCode, 'utf-8');
  console.log(`set config:${name} on ${mainConfigFile}`);
};

export default set;
