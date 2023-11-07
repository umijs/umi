import { Transformer } from '@jest/transform';
import { createHash } from 'crypto';
import { Loader, transformSync } from 'esbuild';
import fs from 'fs';
import { extname, relative } from 'path';
import { resolveOptions } from './options';
import { UserOptions } from './type';

const THIS_FILE = fs.readFileSync(__filename);
const TS_TSX_REGEX = /\.tsx?$/;
const JS_JSX_REGEX = /\.jsx?$/;

function isTarget(path: string) {
  return (
    JS_JSX_REGEX.test(path) || TS_TSX_REGEX.test(path) || path.endsWith('.mjs')
  );
}

const createTransformer = (
  userOptions: UserOptions = {},
): Transformer<UserOptions> => {
  const options = resolveOptions(userOptions);

  return {
    canInstrument: false,
    getCacheKey(fileData: string, filePath: string, transformOptions: any) {
      const { config, instrument, configString } = transformOptions;

      return createHash('md5')
        .update(THIS_FILE)
        .update('\0', 'utf8')
        .update(JSON.stringify(options))
        .update('\0', 'utf8')
        .update(fileData)
        .update('\0', 'utf8')
        .update(relative(config.rootDir, filePath))
        .update('\0', 'utf8')
        .update(configString)
        .update('\0', 'utf8')
        .update(filePath)
        .update('\0', 'utf8')
        .update(instrument ? 'instrument' : '')
        .update('\0', 'utf8')
        .update(process.env.NODE_ENV || '')
        .digest('hex');
    },
    process(source, path, transformOptions) {
      const { config } = transformOptions;
      if (!isTarget(path))
        return {
          code: source,
        };

      let rawCode = source;

      /// this logic or code from
      /// https://github.com/threepointone/esjest-transform/blob/main/src/index.js
      /// this will support the jest.mock
      /// https://github.com/aelbore/esbuild-jest/issues/12
      /// TODO: transform the jest.mock to a function using babel traverse/parse then hoist it
      if (
        rawCode.indexOf('jest.mock(') >= 0 ||
        rawCode.indexOf('jest.doMock(') >= 0
      ) {
        rawCode = require('./transformer').babelTransform({
          sourceText: rawCode,
          sourcePath: path,
          config: transformOptions,
        });
      }

      const result = transformSync(rawCode, {
        ...options,
        ...(config.globals['jest-esbuild'] as UserOptions),
        loader: userOptions.loader || ext2Loader(extname(path)),
        sourcefile: path,
        sourcesContent: false,
      });

      if (result.warnings.length) {
        result.warnings.forEach((m) => {
          // eslint-disable-next-line no-console
          console.warn(m);
        });
      }

      let { map, code } = result;
      map = {
        ...JSON.parse(result.map),
        sourcesContent: null,
      };

      // ref: for debug break point stop at specified line
      // https://github.com/aelbore/esbuild-jest/blob/master/src/index.ts#L59
      code =
        code +
        '\n//# sourceMappingURL=data:application/json;base64,' +
        Buffer.from(JSON.stringify(map)).toString('base64');

      return { code, map };
    },
  };
};

const EXT_MAP: Record<string, Loader> = {
  '.js': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.mjs': 'js',
};

function ext2Loader(ext: string): Loader {
  return EXT_MAP[ext] || 'js';
}

export default {
  createTransformer,
};
