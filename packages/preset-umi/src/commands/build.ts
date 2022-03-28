import { getMarkup } from '@umijs/server';
import { logger } from '@umijs/utils';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../types';
import { clearTmp } from '../utils/clearTmp';
import { lazyImportFromCurrentPkg } from '../utils/lazyImportFromCurrentPkg';
import { getAssetsMap } from './dev/getAssetsMap';
import { getBabelOpts } from './dev/getBabelOpts';
import { getMarkupArgs } from './dev/getMarkupArgs';
import { printMemoryUsage } from './dev/printMemoryUsage';

const bundlerWebpack: typeof import('@umijs/bundler-webpack') =
  lazyImportFromCurrentPkg('@umijs/bundler-webpack');
const bundlerVite: typeof import('@umijs/bundler-vite') =
  lazyImportFromCurrentPkg('@umijs/bundler-vite');

export default (api: IApi) => {
  api.registerCommand({
    name: 'build',
    description: 'build app for production',
    details: `
umi build

# build without compression
COMPRESS=none umi build

# clean and build
umi build --clean
`,
    fn: async function () {
      // clear tmp except cache
      clearTmp(api.paths.absTmpPath);

      // check package.json
      await api.applyPlugins({
        key: 'onCheckPkgJSON',
        args: {
          origin: null,
          current: api.appData.pkg,
        },
      });

      // generate files
      async function generate(opts: { isFirstTime?: boolean; files?: any }) {
        await api.applyPlugins({
          key: 'onGenerateFiles',
          args: {
            files: opts.files || null,
            isFirstTime: opts.isFirstTime,
          },
        });
      }
      await generate({
        isFirstTime: true,
      });

      await api.applyPlugins({
        key: 'onBeforeCompiler',
      });

      // build
      // TODO: support watch mode
      const {
        babelPreset,
        beforeBabelPlugins,
        beforeBabelPresets,
        extraBabelPlugins,
        extraBabelPresets,
      } = await getBabelOpts({ api });
      const chainWebpack = async (memo: any, args: Object) => {
        await api.applyPlugins({
          key: 'chainWebpack',
          type: api.ApplyPluginsType.modify,
          initialValue: memo,
          args,
        });
      };
      const modifyWebpackConfig = async (memo: any, args: Object) => {
        return await api.applyPlugins({
          key: 'modifyWebpackConfig',
          initialValue: memo,
          args,
        });
      };
      const modifyViteConfig = async (memo: any, args: Object) => {
        return await api.applyPlugins({
          key: 'modifyViteConfig',
          initialValue: memo,
          args,
        });
      };
      const opts = {
        config: api.config,
        cwd: api.cwd,
        entry: {
          umi: join(api.paths.absTmpPath, 'umi.ts'),
        },
        ...(api.config.vite
          ? { modifyViteConfig }
          : { babelPreset, chainWebpack, modifyWebpackConfig }),
        beforeBabelPlugins,
        beforeBabelPresets,
        extraBabelPlugins,
        extraBabelPresets,
        onBuildComplete(opts: any) {
          printMemoryUsage();
          api.applyPlugins({
            key: 'onBuildComplete',
            args: opts,
          });
        },
        clean: api.args.clean,
      };

      let stats: any;
      if (api.config.vite) {
        stats = await bundlerVite.build(opts);
      } else {
        stats = await bundlerWebpack.build(opts);
      }

      // generate html
      // vite 在 build 时通过插件注入 js 和 css
      const assetsMap = api.config.vite
        ? {}
        : getAssetsMap({
            stats,
            publicPath: api.config.publicPath,
          });
      const { vite } = api.args;
      const markupArgs = await getMarkupArgs({ api });
      // @ts-ignore
      const markup = await getMarkup({
        ...markupArgs,
        styles: (api.config.vite ? [] : assetsMap['umi.css'] || []).concat(
          markupArgs.styles,
        ),
        scripts: (api.config.vite ? [] : assetsMap['umi.js'] || []).concat(
          markupArgs.scripts,
        ),
        esmScript: !!opts.config.esm || vite,
        path: '/',
      });
      writeFileSync(
        join(api.paths.absOutputPath, 'index.html'),
        markup,
        'utf-8',
      );
      logger.event('Build index.html');

      // print size
    },
  });
};
