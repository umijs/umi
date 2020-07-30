import { IApi } from '@umijs/types';
import { relative, dirname, join } from 'path';
import { existsSync } from 'fs';
import { Logger } from '@umijs/core';
import {
  cleanTmpPathExceptCache,
  getBundleAndConfigs,
  printFileSizes,
} from '../buildDevUtils';
import generateFiles from '../generateFiles';

const logger = new Logger('umi:preset-build-in');

export default function (api: IApi) {
  const {
    paths,
    utils: { rimraf, chalk },
  } = api;

  api.registerCommand({
    name: 'build',
    description: 'build application for production',
    fn: async function () {
      cleanTmpPathExceptCache({
        absTmpPath: paths.absTmpPath!,
      });

      // for #5129, #4633
      // ensure dev generated tmp files is removed
      // this should work with "@@/*": ["src/.umi/*", "src/.umi-production/*"] in tsconfig.json
      const devTmpPath = join(dirname(paths.absTmpPath!), '.umi');
      logger.debug(`Clear devTmpPath: ${devTmpPath}`);
      rimraf.sync(devTmpPath);

      // generate files
      await generateFiles({ api, watch: false });

      // build
      const {
        bundler,
        bundleConfigs,
        bundleImplementor,
      } = await getBundleAndConfigs({ api });
      try {
        // clear output path before exec build
        if (process.env.CLEAR_OUTPUT !== 'none') {
          if (paths.absOutputPath && existsSync(paths.absOutputPath || '')) {
            logger.debug(`Clear OutputPath: ${paths.absNodeModulesPath}`);
            rimraf.sync(paths.absOutputPath);
          }
        }

        const { stats } = await bundler.build({
          bundleConfigs,
          bundleImplementor,
        });
        if (process.env.RM_TMPDIR !== 'none') {
          rimraf.sync(paths.absTmpPath!);
        }
        printFileSizes(stats, relative(process.cwd(), paths.absOutputPath!));
        await api.applyPlugins({
          key: 'onBuildComplete',
          type: api.ApplyPluginsType.event,
          args: {
            stats,
          },
        });
      } catch (err) {
        await api.applyPlugins({
          key: 'onBuildComplete',
          type: api.ApplyPluginsType.event,
          args: {
            err,
          },
        });
        // throw build error
        throw err;
      }
    },
  });
}
