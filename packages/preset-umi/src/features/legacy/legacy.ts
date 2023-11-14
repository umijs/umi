import {
  CSSMinifier,
  Env,
  JSMinifier,
  Transpiler,
} from '@umijs/bundler-webpack/dist/types';
import { chalk, crossSpawn, lodash, logger, resolve } from '@umijs/utils';
import { join } from 'path';
import type { IApi } from '../../types';

type WebpackChainFunc = Parameters<IApi['chainWebpack']>[0];
type WebpackChainConfig = Parameters<WebpackChainFunc>[0];
interface ILegacyOpts {
  buildOnly?: boolean;
  nodeModulesTransform?: boolean;
}

export default (api: IApi) => {
  api.describe({
    key: 'legacy',
    config: {
      schema({ zod }) {
        return zod
          .object({
            buildOnly: zod.boolean(),
            nodeModulesTransform: zod.boolean(),
            checkOutput: zod.boolean(),
          })
          .deepPartial();
      },
    },
    enableBy: api.EnableBy.config,
  });

  const legacyModeLabel = chalk.bold.bgBlue(' LEGACY MODE ');
  const pluginConfig = api.config.legacy || api.userConfig.legacy || {};
  const enableEsCheck = pluginConfig?.checkOutput;
  if (api.env === Env.production && enableEsCheck) {
    api.addOnDemandDeps(() => {
      return [
        {
          name: 'es-check',
          version: '^7.1.0',
          reason: 'es-check is used to check output files in legacy mode',
        },
      ];
    });
    api.onBuildComplete(({ err }) => {
      if (err) {
        return;
      }
      const cwd = api.cwd;
      const scriptPath = resolve.sync('es-check', { basedir: cwd });
      logger.info(
        `${legacyModeLabel} Start checking output ${chalk.cyan(
          '.js',
        )} files with ${chalk.cyan('es-check')}...`,
      );
      crossSpawn(
        scriptPath,
        ['es5', join(api.paths.absOutputPath, '**/*.js')],
        {
          stdio: 'inherit',
          cwd,
        },
      );
    });
  }

  api.modifyConfig({
    stage: Number.MAX_SAFE_INTEGER,
    fn: (memo) => {
      const { userConfig } = api;
      // compatible use plugin config scene
      const { buildOnly = true, nodeModulesTransform = true }: ILegacyOpts =
        pluginConfig;

      if (api.env === Env.development) {
        if (buildOnly) {
          return memo;
        }
        // mfsu is using top level await, we should close it
        memo.mfsu = false;
        logger.warn(
          `${legacyModeLabel} mfsu is not supported in ${chalk.cyan(
            'legacy',
          )} mode, we automatically close mfsu`,
        );
      }

      if (
        userConfig.srcTranspiler ||
        userConfig.jsMinifier ||
        userConfig.cssMinifier
      ) {
        logger.fatal(
          `${legacyModeLabel} Manual configuration of ${[
            'srcTranspiler',
            'jsMinifier',
            'cssMinifier',
          ]
            .map((i) => chalk.yellow(i))
            .join(', ')} is not supported when ${chalk.cyan(
            'legacy',
          )} build mode enabled.`,
        );
        throw new Error(
          'Manual configuration of legacy mode is not supported.',
        );
      }

      /**
       * 🟢 babel:    only babel supported transform to es5
       * 🟡 swc:      support es5, but existence of edge case
       * 🔴 esbuild:  not supported es5
       */
      memo.srcTranspiler = Transpiler.babel;

      /**
       * 🟢 terser:   keep ecma target, same behavior as old bundle cli
       * 🟡 uglifyJs: cannot compress some package, may throw error
       * 🟡 swc:      support es5, but existence of edge case, need additional install @swc/core dep
       * 🔴 esbuild:  not supported es5
       */
      memo.jsMinifier = JSMinifier.terser;

      /**
       * 🟢 cssnano:   same behavior as before
       * 🟢 parcelCSS: support low version targets, but need additional install package
       * 🔴 esbuild:   not supported low version browser as targets
       */
      memo.cssMinifier = CSSMinifier.cssnano;

      // specify a low-compatibility target for babel transform
      const ieTarget = userConfig.targets?.ie || api.config.targets?.ie || 11;
      memo.targets = {
        ...userConfig.targets,
        ie: ieTarget,
      };

      logger.info(
        `${legacyModeLabel} is enabled, we automatically modify the ${[
          'srcTranspiler',
          'jsMinifier',
          'cssMinifier',
        ]
          .map((i) => chalk.yellow(i))
          .join(', ')} to be compatible with IE 11`,
      );

      const originChainWebpack = userConfig.chainWebpack;
      memo.chainWebpack = ((memo, ...args) => {
        if (originChainWebpack) {
          originChainWebpack(memo, ...args);
        }

        // transform all node_modules pkgs to es5
        if (nodeModulesTransform) {
          memo.module
            .rule('extra-src')
            .include.add(/node_modules/)
            .end();
        }

        // prevent transform node_modules some problems
        memo.module
          .rule('extra-src')
          // prevent transform `core-js` polyfill
          // https://github.com/umijs/umi/issues/9124
          // https://github.com/zloirock/core-js/issues/514
          .exclude.add(/core-js/)
          // prevent transform util functions
          // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/471
          .add(/node_modules\/(css-loader)/)
          .end();

        // ensure svgr transform outputs is es5
        useBabelTransformSvgr(memo, api);

        // Top level sync import cannot be used with async externalType
        // https://github.com/webpack/webpack/issues/12465
        // https://github.com/webpack/webpack/issues/11874
        if (!lodash.isEmpty(userConfig.externals)) {
          const externalsAsString = JSON.stringify(userConfig.externals);
          const externalsType = memo.get('externalsType');
          // We should print warning: async externalsType should not be used
          if (
            // e.g.
            //  externals: {
            //    lodash: ['script http://path', '_']
            //  }
            externalsAsString.includes('script ') ||
            // e.g.
            // chainWebpack(memo) {
            //   memo.set('externalsType', 'script');
            //   return memo
            // }
            externalsType
          ) {
            logger.warn(
              `${legacyModeLabel} Legacy browsers do not support ${chalk.yellow(
                'Top level await',
              )}, ensure you are not using both ${chalk.bold.red(
                `Top level sync import`,
              )} and ${chalk.bold.red('Async externalsType (e.g. script)')}`,
            );
          }
        }

        return memo;
      }) as WebpackChainFunc;

      return memo;
    },
  });
};

function useBabelTransformSvgr(memo: WebpackChainConfig, api: IApi) {
  memo.module
    .rule('svgr')
    .use('babel-loader')
    .loader(require.resolve('@umijs/bundler-webpack/compiled/babel-loader'))
    .options({
      sourceType: 'unambiguous',
      babelrc: false,
      configFile: false,
      cacheDirectory: false,
      browserslistConfigFile: false,
      targets: api.config.targets,
      presets: [
        [
          require.resolve('@umijs/babel-preset-umi'),
          {
            presetEnv: {},
            presetReact: {},
            presetTypeScript: {},
          },
        ],
      ],
    })
    .before('svgr-loader')
    .end();
}
