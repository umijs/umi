import { winPath } from '@umijs/utils';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'fs';
import { isAbsolute, join, parse as pathParse } from 'path';
import { getDepReExportContent } from './getDepReExportContent';

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
    .concat([...code.matchAll(/exports\.(\w+)/g)].map((result) => result[1]));
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

const parseFileExport = async (filePath: string, packageName: string) => {
  const content = readFileSync(filePath, 'utf-8');
  return getDepReExportContent({
    content,
    filePath,
    importFrom: packageName,
  });
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
  importFrom: string,
): Promise<string> => {
  if (isAbsolute(importFrom)) {
    return readPathImport(importFrom);
  } else {
    return readPackageImport(
      winPath(join(cwd, 'node_modules', importFrom)),
      importFrom,
    );
  }
};
