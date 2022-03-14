import { generate, getASTByFilePath, setConfigByName } from '@umijs/ast';
import prettier from '@umijs/utils/compiled/prettier';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

export function set(api: IApi, name: string, value: any) {
  let { mainConfigFile } = api.appData;

  // write empty config if config file not exists
  if (!mainConfigFile) {
    const absPath = join(api.cwd, '.umirc.ts');
    const content = `export default {};`;
    writeFileSync(absPath, content, 'utf-8');
    mainConfigFile = absPath;
  }

  const ast = getASTByFilePath(mainConfigFile);
  if (!ast) return;
  const generateCode = generate(setConfigByName(ast, name, value)!);
  const printStr = prettier.format(generateCode, {
    parser: 'typescript',
  });
  writeFileSync(mainConfigFile, printStr, 'utf-8');
  console.log(`set config:${name} on ${mainConfigFile}`);
}
