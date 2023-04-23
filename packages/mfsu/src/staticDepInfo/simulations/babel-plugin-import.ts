import type { ImportSpecifier } from '@umijs/bundler-utils/compiled/es-module-lexer';
import { logger, winPath } from '@umijs/utils';
import { join } from 'path';
import { getAliasedPathWithLoopDetect } from '../../babelPlugins/awaitImport/getAliasedPath';
import parseImport from '../importParser';
import type { Match } from '../staticDepInfo';

export default function createHandle(importOptions: {
  libraryName: string;
  libraryDirectory: string;
  style: boolean | string;
  camel2UnderlineComponentName?: boolean;
  camel2DashComponentName?: boolean;
}) {
  const { libraryName, libraryDirectory } = importOptions;

  const useUnderline = importOptions.camel2UnderlineComponentName;
  const useDash = importOptions.camel2DashComponentName ?? true;

  const transformName = useUnderline
    ? (n: string) => transCamel(n, '_')
    : useDash
    ? (n: string) => transCamel(n, '-')
    : (n: string) => n;

  /*
    todo support other config values
     [x] boolean true
     [x] string css
     [ ] function
   */

  const stylePathFromCompPath =
    importOptions.style === 'css'
      ? (compFsPath: string) => winPath(join(compFsPath, 'style/css'))
      : (compFsPath: string) => winPath(join(compFsPath, 'style'));

  return function handleImports(opts: {
    rawCode: string;
    imports: ImportSpecifier[];
    mfName: string;
    alias: Record<string, string>;
    pathToVersion(p: string): string;
  }): Match[] {
    const { imports, rawCode } = opts;
    if (imports?.length > 0) {
      const version = opts.pathToVersion(libraryName);

      function addToMatches(moduleFsPath: string) {
        const unAliasedModulePath = getAliasedPathWithLoopDetect({
          value: winPath(moduleFsPath),
          alias: opts.alias,
        });
        retMatched.push({
          isMatch: true,
          value: unAliasedModulePath,
          replaceValue: `${mfName}/${winPath(unAliasedModulePath)}`,
          version,
        });

        const unAliasedStylePath = getAliasedPathWithLoopDetect({
          value: stylePathFromCompPath(moduleFsPath),
          alias: opts.alias,
        });
        retMatched.push({
          isMatch: true,
          value: unAliasedStylePath,
          replaceValue: `${mfName}/${winPath(unAliasedStylePath)}`,
          version,
        });
      }

      const importSnippets = imports
        .map(({ ss, se }) => {
          return rawCode.slice(ss, se + 1);
        })
        .join('\n');
      const retMatched: Match[] = [];

      const parsedImports = parseImport(importSnippets);
      const importedVariable = new Set<string>();

      for (const i of parsedImports) {
        i.imports.forEach((v) => {
          if (v === '*') {
            errorLogForSpaceImport(libraryName);
          }
          importedVariable.add(v);
        });
      }

      const mfName = opts.mfName;

      for (const v of importedVariable.entries()) {
        const importVariableName = v[0];

        if (importVariableName === 'default') {
          addToMatches(join(libraryName, libraryDirectory));
          continue;
        }

        const transformedName = transformName(importVariableName);
        const importFsPath = join(
          libraryName,
          libraryDirectory,
          transformedName,
        );
        addToMatches(importFsPath);
      }
      return retMatched;
    }
    return [];
  };
}

function transCamel(_str: string, symbol: string): string {
  const str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, ($1) => `${symbol}${$1.toLowerCase()}`);
}

function errorLogForSpaceImport(libraryName: string) {
  logger.error(
    `"import * as ant from 'antd'" or "export * from '${libraryName}'" are not allowed in mfsu#strategy='eager'`,
  );
  logger.error(`solutions:`);
  logger.error(`  change to "import { Xxx } from '${libraryName}'" or`);
  logger.error(`            "export { Xxx } from '${libraryName}'" syntax`);
  logger.error(`  or use mfsu#strategy='normal' configuration`);

  throw Error(`"import * as ant from 'antd'" not allowed in mfsu#version=4`);
}
