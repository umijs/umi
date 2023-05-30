import esbuild, { PartialMessage } from '@umijs/bundler-utils/compiled/esbuild';
import less from '@umijs/bundler-utils/compiled/less';
import { winPath } from '@umijs/utils';
import { readFileSync } from 'fs';
import { basename, dirname, extname, join, resolve } from 'path';
import { ensureLastSlash, getClassNames, hashString } from './css-loader';

export const lessLoader = (opts: {
  cwd: string;
  lessOptions?: Less.Options;
}): esbuild.Plugin => {
  const { lessOptions = {} } = opts;
  return {
    name: 'less-loader',
    setup: (build) => {
      // Resolve *.less files with namespace
      build.onResolve({ filter: /\.less$/, namespace: 'file' }, (args) => {
        const filePath = join(args.resolveDir, args.path);
        return {
          path: filePath,
          watchFiles: [filePath, ...getLessImports(filePath)],
        };
      });

      // Build .less files
      build.onLoad({ filter: /\.less$/, namespace: 'file' }, async (args) => {
        const content = readFileSync(args.path, 'utf-8');
        const dir = dirname(args.path);
        const filename = basename(args.path);
        const relFilename = winPath(args.path).replace(
          ensureLastSlash(winPath(opts.cwd)),
          '',
        );
        try {
          const result = await less.render(content, {
            filename,
            rootpath: dir,
            ...lessOptions,
            paths: [...(lessOptions.paths || []), dir],
          });

          const classNames = getClassNames(
            Buffer.from(result.css),
            filename,
          ).sort();
          const cssModuleObject = classNames.reduce<Record<string, string>>(
            (memo, key) => {
              memo[key] = `${key}___${hashString(`${relFilename}@${key}`)}`;
              return memo;
            },
            {},
          );
          return {
            contents: `export default ${JSON.stringify(cssModuleObject)};`,
            loader: 'js',
            resolveDir: dir,
          };
        } catch (e: any) {
          return {
            errors: [convertLessError(e)],
            resolveDir: dir,
          };
        }
      });
    },
  };
};

const importRegex = /@import(?:\s+\((.*)\))?\s+['"](.*)['"]/;
const globalImportRegex = /@import(?:\s+\((.*)\))?\s+['"](.*)['"]/g;
const importCommentRegex = /\/\*[\s\S]*?\*\/|(\/\/.*$)/gm;

const extWhitelist = ['.css', '.less'];

/** Recursively get .less/.css imports from file */
export const getLessImports = (filePath: string): string[] => {
  try {
    const dir = dirname(filePath);
    const content = readFileSync(filePath).toString('utf8');

    const cleanContent = content.replace(importCommentRegex, '');
    const match = cleanContent.match(globalImportRegex) || [];

    const fileImports = match
      .map((el) => {
        const match = el.match(importRegex);
        return match ? match[2] : '';
      })
      .filter((el) => !!el)
      // NOTE: According to the docs, extensionless imports are interpreted as '.less' files.
      // http://lesscss.org/features/#import-atrules-feature-file-extensions
      // https://github.com/iam-medvedev/esbuild-plugin-less/issues/13
      .map((el) => resolve(dir, extname(el) ? el : `${el}.less`));

    const recursiveImports = fileImports.reduce((result, el) => {
      return [...result, ...getLessImports(el)];
    }, fileImports);
    return recursiveImports.filter((el) =>
      extWhitelist.includes(extname(el).toLowerCase()),
    );
  } catch (e) {
    return [];
  }
};

/** Convert less error into esbuild error */
export const convertLessError = (error: Less.RenderError): PartialMessage => {
  const sourceLine = error.extract.filter((line) => line);
  const lineText = sourceLine.length === 3 ? sourceLine[1] : sourceLine[0];
  return {
    text: error.message,
    location: {
      namespace: 'file',
      file: error.filename,
      line: error.line,
      column: error.column,
      lineText,
    },
  };
};
