import type { Stats } from '@umijs/bundler-webpack/compiled/webpack';
import {
  chalk,
  filesize,
  gzipSize as _gzipSize,
  stripAnsi,
} from '@umijs/utils';
import fs from 'fs';
import path from 'path';

const gzipSize = _gzipSize.gzipSizeSync;

interface ISizes {
  root: string;
  sizes: Record<string, number>;
}

const WARN_GZIP_SIZE = 1024 * 1024;
export function printFileSizesAfterBuild(opts: {
  webpackStats: Stats;
  previousSizeMap: ISizes;
  buildFolder: string;
  suggestMaxSize?: number;
}) {
  const {
    webpackStats,
    previousSizeMap,
    buildFolder,
    suggestMaxSize = WARN_GZIP_SIZE,
  } = opts;
  const { root, sizes } = previousSizeMap;
  const assets = webpackStats
    .toJson({ all: false, assets: true })
    .assets?.filter((asset) => canReadAsset(asset.name))
    .map((asset) => {
      const content = fs.readFileSync(path.join(root, asset.name), {
        encoding: 'utf-8',
      });
      const size = gzipSize(content);
      const key = removeFileNameHash(root, asset.name);
      const previousSize = sizes[key];
      const difference = getDifferenceLabel(size, previousSize);
      return {
        folder: path.join(path.basename(buildFolder), path.dirname(asset.name)),
        name: path.basename(asset.name),
        size: size,
        sizeLabel:
          filesize.filesize(size) + (difference ? ' (' + difference + ')' : ''),
      };
    });
  if (!assets?.length) {
    return;
  }
  assets.sort((a, b) => b.size - a.size);
  const longestSizeLabelLength = Math.max(
    ...assets.map((a) => stripAnsi(a.sizeLabel).length),
  );
  let suggestBundleSplitting = false;
  assets.forEach((asset) => {
    let sizeLabel = asset.sizeLabel;
    const sizeLength = stripAnsi(sizeLabel).length;
    if (sizeLength < longestSizeLabelLength) {
      const rightPadding = ' '.repeat(longestSizeLabelLength - sizeLength);
      sizeLabel += rightPadding;
    }
    const isLarge = asset.size > suggestMaxSize;
    if (isLarge && path.extname(asset.name) === '.js') {
      suggestBundleSplitting = true;
    }
    console.log(
      '  ' +
        (isLarge ? chalk.yellow(sizeLabel) : sizeLabel) +
        '  ' +
        chalk.dim(asset.folder + path.sep) +
        chalk.cyan(asset.name),
    );
  });
  if (suggestBundleSplitting) {
    console.log();
    console.log(
      chalk.yellow('The bundle size is significantly larger than recommended.'),
    );
    console.log(
      chalk.yellow('Consider reducing it with code splitting: '),
      chalk.cyan('https://umijs.org/blog/code-splitting'),
    );
    console.log(
      chalk.yellow('You can also analyze the project dependencies: '),
      chalk.cyan('https://umijs.org/docs/guides/env-variables#analyze'),
    );
  }
  console.log();
}

// Input: 1024, 2048
// Output: "(+1 KB)"
const FIFTY_KILOBYTES = 1024 * 50;
function getDifferenceLabel(currentSize: number, previousSize: number) {
  const difference = currentSize - previousSize;
  const fileSize = !Number.isNaN(difference)
    ? filesize.filesize(difference)
    : 0;
  if (difference >= FIFTY_KILOBYTES) {
    return chalk.red('+' + fileSize);
  } else if (difference < FIFTY_KILOBYTES && difference > 0) {
    return chalk.yellow('+' + fileSize);
  } else if (difference < 0) {
    return chalk.green(fileSize);
  } else {
    return '';
  }
}

function recursive(dir: string) {
  const list: string[] = [];
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const absPath = path.join(dir, file);
      if (fs.statSync(absPath).isDirectory()) {
        list.push(...recursive(absPath));
        return;
      }
      list.push(absPath);
    });
    return list;
  }
  return list;
}

function canReadAsset(file: string) {
  return (
    /\.(js|css)$/.test(file) &&
    !/service-worker\.js/.test(file) &&
    !/precache-manifest\.[0-9a-f]+\.js/.test(file)
  );
}

function removeFileNameHash(dir: string, fileName: string) {
  return fileName
    .replace(dir, '')
    .replace(/\\/g, '/')
    .replace(
      /\/?(.*)(\.[0-9a-f]+)(\.chunk)?(\.js|\.css)/,
      (_match, p1, _p2, _p3, p4) => p1 + p4,
    )
    .replace(/^\//, '');
}

export function measureFileSizesBeforeBuild(dir: string): ISizes {
  const fileNames = recursive(dir);
  const sizes = fileNames
    .filter(canReadAsset)
    .reduce<ISizes['sizes']>((memo, fileName) => {
      const content = fs.readFileSync(fileName, { encoding: 'utf-8' });
      const key = removeFileNameHash(dir, fileName);
      memo[key] = gzipSize(content);
      return memo;
    }, {});
  return {
    root: dir,
    sizes: sizes,
  };
}
