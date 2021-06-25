import { winPath } from '@umijs/utils';
import { init, parse } from 'es-module-lexer';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'fs';
import { join, parse as pathParse } from 'path';

export const copy = (fromDir: string, toDir: string) => {
  try {
    const fn = (dir: string, preserveDir: string) => {
      const _dir = readdirSync(dir);
      _dir.forEach((value) => {
        const _path = join(dir, value);
        const stat = statSync(_path);
        if (stat.isDirectory()) {
          const _toDir = join(toDir, preserveDir, value);
          if (!existsSync(_toDir)) {
            mkdirSync(_toDir);
          }
          fn(_path, join(preserveDir, value));
        } else {
          const toDest = join(toDir, preserveDir);
          copyFileSync(_path, join(toDest, value));
        }
      });
    };
    fn(fromDir, '');
  } catch (error) {
    throw error;
  }
};

export const cjsModeEsmParser = (code: string) => {
  return [
    ...code.matchAll(
      /Object\.defineProperty\(\s*exports\s*\,\s*[\"|\'](\w+)[\"|\']/g,
    ),
  ]
    .map((result) => result[1])
    .concat(
      [...code.matchAll(/exports(\.|\[(\'|\"))(\w+)(\s*|(\'|\")\])\s*\=/g)].map(
        (result) => {
          return result[Math.floor(result.length / 2)];
        },
      ),
    );
};

export const filenameFallback = async (absPath: string): Promise<string> => {
  try {
    const exts = ['.esm.js', '.mjs', '.js', '.ts', '.jsx', '.tsx'];
    if (exts.includes(pathParse(absPath).ext)) {
      return await parseFileExport(absPath, absPath);
    }

    for (let i = 0; i < exts.length; i++) {
      const filename = absPath + exts[i];
      if (existsSync(filename)) {
        return await parseFileExport(filename, filename);
      }
    }
    const indexJs = join(absPath, 'index.js'); // runtime-regenerator
    if (existsSync(indexJs)) {
      return parseFileExport(indexJs, indexJs);
    }
    return `import "${winPath(absPath)}"; export {}; // filename fallback`;
  } catch (error) {
    throw error;
  }
};

export const getExportStatement = (
  importFrom: string,
  cjs: boolean,
  hasDefault: boolean,
) =>
  cjs
    ? `import _ from "${winPath(
        importFrom,
      )}";\nexport default _;\nexport * from "${winPath(importFrom)}";`
    : `${
        hasDefault
          ? `import _ from "${winPath(importFrom)}";\nexport default _;`
          : ''
      }\nexport * from "${winPath(importFrom)}";`;

const parseFileExport = async (filePath: string, packageName: string) => {
  try {
    if (!existsSync(filePath)) {
      return '';
    }
    const file = readFileSync(filePath, 'utf-8');
    await init;
    try {
      var [imports, exports] = parse(file);
    } catch (error) {
      throw `parse ${filePath} error.` + error;
    }
    // cjs
    if (!imports.length && !exports.length) {
      const cjsModeEsmExport = cjsModeEsmParser(file);
      if (cjsModeEsmExport && cjsModeEsmExport.includes('__esModule')) {
        if (cjsModeEsmExport.includes('default')) {
          return getExportStatement(packageName, false, true);
        } else {
          return getExportStatement(packageName, false, false);
        }
      }
      return getExportStatement(packageName, true, false);
    }
    // esm
    if (exports.length) {
      return getExportStatement(
        packageName,
        false,
        exports.includes('default'),
      );
    } else {
      return `import "${winPath(
        packageName,
      )}"; export {}; // no export fallback`;
    }
  } catch (error) {
    throw error;
  }
};

const readPackageImport = (
  packagePath: string,
  packageName: string,
): Promise<string> => {
  const packageJson = join(packagePath, 'package.json');
  try {
    if (existsSync(packageJson)) {
      const { module, main } = JSON.parse(
        readFileSync(packageJson, 'utf-8') || '{}',
      );
      const entry = join(packagePath, module || main || 'index.js');
      return parseFileExport(entry, packageName);
    } else {
      // try add ext. such as: 'regenerator-runtime/runtime' means 'regenerator-runtime/runtime.js'
      return filenameFallback(packagePath);
    }
  } catch (err) {
    throw err;
  }
};

const readPathImport = async (absPath: string) => {
  try {
    if (existsSync(absPath)) {
      if (statSync(absPath).isDirectory()) {
        return readPackageImport(absPath, absPath);
      } else {
        return parseFileExport(absPath, absPath);
      }
    } else {
      return filenameFallback(absPath);
    }
  } catch (error) {
    throw error;
  }
};

export const figureOutExport = async (
  cwd: string,
  entry: string,
): Promise<string> => {
  if (entry.startsWith('/') || /^[A-Za-z]\:\//.test(entry)) {
    return readPathImport(entry);
  } else {
    return readPackageImport(winPath(join(cwd, 'node_modules', entry)), entry);
  }
};
