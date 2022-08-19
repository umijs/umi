import {
  CSSMinifier,
  Env,
  JSMinifier,
  Transpiler,
} from '@umijs/bundler-webpack/dist/types';
import { chalk, lodash, logger } from '@umijs/utils';
import type { IApi } from '../../types';

type WebpackChainFunc = Parameters<IApi['chainWebpack']>[0];
type WebpackChainConfig = Parameters<WebpackChainFunc>[0];
interface ILegacyOpts {
  buildOnly?: boolean;
}

export default (api: IApi) => {
  api.describe({
    key: 'legacy',
    config: {
      schema(Joi) {
        return Joi.object({
          buildOnly: Joi.boolean(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyConfig({
    stage: Number.MAX_SAFE_INTEGER,
    fn: (memo) => {
      const { userConfig } = api;
      const { buildOnly = true }: ILegacyOpts = userConfig.legacy;

      if (api.env === Env.development) {
        if (buildOnly) {
          return memo;
        }
        // mfsu is using top level await, we should close it
        memo.mfsu = false;
        logger.warn(
          `mfsu is not supported in ${chalk.cyan(
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
          `Manual configuration of ${[
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
      memo.targets = {
        ...userConfig.targets,
        ie: 11,
      };

      // transform all node_modules pkgs to es5
      memo.extraBabelIncludes = [
        ...(memo.extraBabelIncludes || []),
        /node_modules/,
      ];

      logger.ready(
        `${chalk.cyan(
          'legacy',
        )} mode is enabled, we automatically modify the ${[
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
          memo = originChainWebpack(memo, ...args);
        }

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
              `Legacy browsers do not support ${chalk.yellow(
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
      cacheDirectory: false,
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
