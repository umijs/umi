import {
  Chunk,
  Compilation,
  Module,
  NormalModule,
} from '@umijs/bundler-webpack/compiled/webpack';
import { chalk, glob } from '@umijs/utils';
import path from 'path';
import { DeadCodeParams } from '../types';

export interface Options extends DeadCodeParams {
  patterns: string[];
  exclude: string[];
  failOnHint: boolean;
  detectUnusedFiles: boolean;
  detectUnusedExport: boolean;
}
export const disabledFolders: string[] = [
  'node_modules',
  '.umi',
  '.umi-production',
  'dist',
];

type FileDictionary = Record<string, boolean>;
type ExportDictionary = Record<string, string[]>;

const detectDeadCode = (compilation: Compilation, options: Options) => {
  const assets: string[] = getWebpackAssets(compilation);
  const compiledFilesDictionary: FileDictionary = convertFilesToDict(assets);
  const includedFiles: string[] = getPattern(options)
    .map((pattern) => glob.sync(pattern))
    .flat();

  const unusedFiles: string[] = options.detectUnusedFiles
    ? includedFiles.filter((file) => !compiledFilesDictionary[file])
    : [];
  const unusedExportMap: ExportDictionary = options.detectUnusedExport
    ? getUnusedExportMap(convertFilesToDict(includedFiles), compilation)
    : {};

  logUnusedFiles(unusedFiles);
  logUnusedExportMap(unusedExportMap);

  const hasUnusedThings =
    unusedFiles.length || Object.keys(unusedExportMap).length;
  if (hasUnusedThings && options.failOnHint) {
    process.exit(2);
  }
};

const getPattern = (options: Options): string[] => {
  return options.patterns
    .map((pattern) => path.resolve(options.context || '', pattern))
    .concat(
      options.exclude.map((pattern) =>
        path.resolve(options.context || '', `!${pattern}`),
      ),
    )
    .map(convertToUnixPath);
};

const getUnusedExportMap = (
  includedFileMap: FileDictionary,
  compilation: Compilation,
): ExportDictionary => {
  const unusedExportMap: ExportDictionary = {};

  compilation.chunks.forEach((chunk) => {
    compilation.chunkGraph.getChunkModules(chunk).forEach((module) => {
      outputUnusedExportMap(
        compilation,
        chunk,
        module,
        includedFileMap,
        unusedExportMap,
      );
    });
  });

  return unusedExportMap;
};

const outputUnusedExportMap = (
  compilation: Compilation,
  chunk: Chunk,
  module: Module,
  includedFileMap: FileDictionary,
  unusedExportMap: ExportDictionary,
) => {
  if (!(module instanceof NormalModule) || !module.resource) {
    return;
  }

  const path = convertToUnixPath(module.resource);
  if (!/^((?!(node_modules)).)*$/.test(path)) return;

  const providedExports =
    compilation.chunkGraph.moduleGraph.getProvidedExports(module);
  const usedExports = compilation.chunkGraph.moduleGraph.getUsedExports(
    module,
    chunk.runtime,
  );

  if (
    usedExports !== true &&
    providedExports !== true &&
    includedFileMap[path]
  ) {
    if (usedExports === false) {
      if (providedExports?.length) {
        unusedExportMap[path] = providedExports;
      }
    } else if (providedExports instanceof Array) {
      const unusedExports = providedExports.filter(
        (item) => usedExports && !usedExports.has(item),
      );

      if (unusedExports.length) {
        unusedExportMap[path] = unusedExports;
      }
    }
  }
};

const logUnusedExportMap = (unusedExportMap: ExportDictionary): void => {
  if (!Object.keys(unusedExportMap).length) {
    return;
  }

  let numberOfUnusedExport = 0;
  let logStr = '';

  Object.keys(unusedExportMap).forEach((filePath, fileIndex) => {
    const unusedExports = unusedExportMap[filePath];

    logStr += [
      `\n${fileIndex + 1}. `,
      chalk.yellow(`${filePath}\n`),
      '    >>>  ',
      chalk.yellow(`${unusedExports.join(',  ')}`),
    ].join('');

    numberOfUnusedExport += unusedExports.length;
  });

  console.log(
    chalk.yellow.bold('\nWarning:'),
    chalk.yellow(
      `There are ${numberOfUnusedExport} unused exports in ${
        Object.keys(unusedExportMap).length
      } files:`,
    ),
    logStr,
    chalk.red.bold('\nPlease be careful if you want to remove them (¬º-°)¬.\n'),
  );
};

const getWebpackAssets = (compilation: Compilation): string[] => {
  const outputPath: string = compilation.getPath(
    compilation.compiler.outputPath,
  );
  const assets: string[] = [
    ...Array.from(compilation.fileDependencies),
    ...compilation
      .getAssets()
      .map((asset) => path.join(outputPath, asset.name)),
  ];

  return assets;
};

const convertFilesToDict = (assets: string[]): FileDictionary => {
  return assets
    .filter(
      (file) =>
        Boolean(file) &&
        disabledFolders.every((disabledPath) => !file.includes(disabledPath)),
    )
    .reduce((fileDictionary, file) => {
      const unixFile = convertToUnixPath(file);

      fileDictionary[unixFile] = true;

      return fileDictionary;
    }, {} as FileDictionary);
};

const logUnusedFiles = (unusedFiles: string[]): void => {
  if (!unusedFiles?.length) {
    return;
  }

  console.log(
    chalk.yellow.bold('\nWarning:'),
    chalk.yellow(`There are ${unusedFiles.length} unused files:`),
    ...unusedFiles.map(
      (file, index) => `\n${index + 1}. ${chalk.yellow(file)}`,
    ),
    chalk.red.bold('\nPlease be careful if you want to remove them (¬º-°)¬.\n'),
  );
};

const convertToUnixPath = (path: string): string => path.replace(/\\+/g, '/');

export default detectDeadCode;
