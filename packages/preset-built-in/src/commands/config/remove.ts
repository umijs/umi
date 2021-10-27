import { getASTByFilePath, removeConfigByName } from '@umijs/ast';
import { generate } from '@umijs/ast/dist/utils/generate';
import { writeFileSync } from 'fs';

const remove = async (mainConfigFile: string, name: string) => {
  const ast = getASTByFilePath(mainConfigFile);
  if (!ast) return;
  const generateCode = generate(removeConfigByName(ast, name));
  await writeFileSync(mainConfigFile, generateCode, 'utf-8');
  console.log(`remove config:${name} on ${mainConfigFile}`);
};

export default remove;
