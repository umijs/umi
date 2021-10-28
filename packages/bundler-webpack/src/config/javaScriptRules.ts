import { chalk } from '@umijs/utils';
import Config from '../../compiled/webpack-5-chain';
import { MFSU_NAME } from '../constants';
import { Env, IConfig, Transpiler } from '../types';
import { es5ImcompatibleVersionsToPkg, isMatch } from '../utils/depMatch';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  extraBabelPlugins: any[];
  name?: string;
}

export async function addJavaScriptRules(opts: IOpts) {
  const { config, userConfig, cwd, env, name } = opts;
  const isDev = opts.env === Env.development;
  const useFastRefresh =
    isDev && userConfig.fastRefresh !== false && name === MFSU_NAME;

  const depPkgs = Object.assign({}, es5ImcompatibleVersionsToPkg());
  const srcRules = [
    config.module
      .rule('src')
      .test(/\.(js|mjs)$/)
      .include.add([
        cwd,
        // import module out of cwd using APP_ROOT
        // issue: https://github.com/umijs/umi/issues/5594
        ...(process.env.APP_ROOT ? [process.cwd()] : []),
      ])
      .end()
      .exclude.add(/node_modules/)
      .end(),
    config.module.rule('jsx-ts-tsx').test(/\.(jsx|ts|tsx)$/),
    config.module
      .rule('extra-src')
      .test(/\.(js|mjs)$/)
      .include.add((path: string) => {
        try {
          if (path.includes('client/client')) return true;
          return isMatch({ path, pkgs: depPkgs });
        } catch (e) {
          console.error(chalk.red(e));
          throw e;
        }
      })
      .end(),
  ] as Config.Rule<Config.Module>[];
  const depRules = [
    config.module
      .rule('dep')
      .test(/\.(js|mjs)$/)
      .include.add(/node_modules/)
      .end()
      .exclude.add((path: string) => {
        try {
          return isMatch({ path, pkgs: depPkgs });
        } catch (e) {
          console.error(chalk.red(e));
          throw e;
        }
      })
      .end(),
  ];

  // const prefix = existsSync(join(cwd, 'src')) ? join(cwd, 'src') : cwd;
  const srcTranspiler = userConfig.srcTranspiler || Transpiler.babel;
  srcRules.forEach((rule) => {
    if (srcTranspiler === Transpiler.babel) {
      rule
        .use('babel-loader')
        .loader(require.resolve('../../compiled/babel-loader'))
        .options({
          // Tell babel to guess the type, instead assuming all files are modules
          // https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
          sourceType: 'unambiguous',
          babelrc: false,
          cacheDirectory: false,
          // process.env.BABEL_CACHE !== 'none'
          //   ? join(cwd, `.umi/.cache/babel-loader`)
          //   : false,
          targets: userConfig.targets,
          presets: [
            [
              require.resolve('@umijs/babel-preset-umi'),
              {
                env,
                presetEnv: {},
                presetReact: {},
                presetTypeScript: {},
                pluginTransformRuntime: {},
                pluginLockCoreJS: {},
                pluginDynamicImportNode: false,
                pluginAutoCSSModules: userConfig.autoCSSModules,
              },
            ],
            ...(userConfig.extraBabelPresets || []).filter(Boolean),
          ],
          plugins: [
            useFastRefresh && require.resolve('react-refresh/babel'),
            ...opts.extraBabelPlugins,
            ...(userConfig.extraBabelPlugins || []),
          ].filter(Boolean),
        });
    } else if (srcTranspiler === Transpiler.swc) {
      // TODO: support javascript
      rule
        .use('swc-loader')
        .loader(require.resolve('../../compiled/swc-loader'))
        .options({
          jsc: {
            parser: {
              syntax: 'typescript',
              dynamicImport: true,
              tsx: true,
            },

            transform: {
              react: {
                runtime: 'automatic',
                pragma: 'React.createElement',
                pragmaFrag: 'React.Fragment',
                throwIfNamespace: true,
                development: env === Env.development,
                useBuiltins: true,
              },
            },
          },
        });
    } else {
      throw new Error(`Unsupported srcTranspiler ${srcTranspiler}.`);
    }
  });

  const depTranspiler = userConfig.depTranspiler || Transpiler.none;
  depRules.forEach((_rule) => {
    if (depTranspiler === Transpiler.none) {
      // noop
    } else {
      throw new Error(`Unsupported depTranspiler ${depTranspiler}.`);
    }
  });
}
