import { getMarkup } from '@umijs/server';
import { importLazy, logger } from '@umijs/utils';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../types';
import { clearTmp } from '../utils/clearTmp';
import { getBabelOpts } from './dev/getBabelOpts';
import { getMarkupArgs } from './dev/getMarkupArgs';
import { printMemoryUsage } from './dev/utils';

const bundlerWebpack: typeof import('@umijs/bundler-webpack') = importLazy(
  '@umijs/bundler-webpack',
);
const bundlerVite: typeof import('@umijs/bundler-vite') = importLazy(
  '@umijs/bundler-vite',
);

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

      function getAssetsMap(stats: any) {
        if (api.config.vite) {
          // TODO: FIXME: vite
          // vite features provides required css and js documents
          return {};
        }

        let ret: Record<string, string> = {};
        for (const asset of stats.toJson().entrypoints['umi'].assets) {
          if (/^umi(\..+)?\.js$/.test(asset.name)) {
            ret['umi.js'] = asset.name;
          }
          if (/^umi(\..+)?\.css$/.test(asset.name)) {
            ret['umi.css'] = asset.name;
          }
        }
        return ret;
      }

      function getAsset(name: string) {
        return assetsMap[name] ? [`/${assetsMap[name]}`] : [];
      }

      // generate html
      const assetsMap = getAssetsMap(stats);
      const { vite } = api.args;
      const markupArgs = await getMarkupArgs({ api });
      // @ts-ignore
      const markup = await getMarkup({
        ...markupArgs,
        styles: getAsset('umi.css').concat(markupArgs.styles),
        scripts: getAsset('umi.js').concat(markupArgs.scripts),
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
