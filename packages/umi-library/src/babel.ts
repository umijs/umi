import { join, extname } from 'path';
import { existsSync, statSync } from 'fs';
import vfs from 'vinyl-fs';
import signale from 'signale';
import rimraf from 'rimraf';
import through from 'through2';
import slash from 'slash2';
import * as chokidar from 'chokidar';
import * as babel from '@babel/core';
import getBabelConfig from './getBabelConfig';
import { IBundleOptions } from './types';

interface IBabelOpts {
  cwd: string;
  type: 'esm' | 'cjs';
  target?: 'browser' | 'node';
  watch?: boolean;
  bundleOpts: IBundleOptions;
}

interface ITransformOpts {
  file: {
    contents: string;
    path: string;
  };
  type: 'esm' | 'cjs';
}

export default async function(opts: IBabelOpts) {
  const {
    cwd,
    type,
    watch,
    bundleOpts: {
      target = 'browser',
      runtimeHelpers,
      extraBabelPresets = [],
      extraBabelPlugins = [],
    },
  } = opts;
  const srcPath = join(cwd, 'src');
  const targetDir = type === 'esm' ? 'es' : 'lib';
  const targetPath = join(cwd, targetDir);

  signale.info(`Clean ${targetDir} directory`);
  rimraf.sync(targetPath);

  function transform(opts: ITransformOpts) {
    const { file, type } = opts;
    signale.info(
      `[${type}] Transform: ${slash(file.path).replace(`${cwd}/`, '')}`,
    );

    const babelOpts = getBabelConfig({
      target,
      type,
      typescript: true,
      runtimeHelpers,
    });
    babelOpts.presets.push(...extraBabelPresets);
    babelOpts.plugins.push(...extraBabelPlugins);

    return babel.transform(file.contents, {
      ...babelOpts,
      filename: file.path,
    }).code;
  }

  function createStream(src) {
    return vfs
      .src(src, {
        allowEmpty: true,
        base: srcPath,
      })
      .pipe(
        through.obj((file, env, cb) => {
          file.contents = Buffer.from(
            transform({
              file,
              type,
            }),
          );
          // .tsx? -> .js
          file.path = file.path.replace(extname(file.path), '.js');
          cb(null, file);
        }),
      )
      .pipe(vfs.dest(targetPath));
  }

  return new Promise(resolve => {
    createStream([
      join(srcPath, '**/*'),
      `!${join(srcPath, '**/fixtures/**/*')}`,
      `!${join(srcPath, '**/.(test|e2e|spec).(js|jsx|ts|tsx)')}`,
    ]).on('end', () => {
      if (watch) {
        signale.info('Start watch', srcPath);
        chokidar
          .watch(srcPath, {
            ignoreInitial: true,
          })
          .on('all', (event, fullPath) => {
            const relPath = fullPath.replace(srcPath, '');
            signale.info(`[${event}] ${join(srcPath, relPath)}`);
            if (!existsSync(fullPath)) return;
            if (statSync(fullPath).isFile()) {
              createStream([fullPath]);
            }
          });
      }
      resolve();
    });
  });
}
