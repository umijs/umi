import { chalk, winPath } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import Config from '../../compiled/webpack-5-chain';
import { Env, IConfig, Transpiler } from '../types';
import { es5ImcompatibleVersionsToPkg, isMatch } from './depMatch';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function applyJavaScriptRules(opts: IOpts) {
  const { config, userConfig, cwd, env } = opts;

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
    config.module
      .rule('jsx-ts-tsx')
      .test(/\.(jsx|ts|tsx)$/)
      .include.add(/node_modules/)
      .end(),
    config.module
      .rule('extra-src')
      .test(/\.(js|mjs)$/)
      .include.add((path: string) => {
        try {
          return isMatch({ path, pkgs: depPkgs });
        } catch (e) {
          console.error(chalk.red(e));
          throw e;
        }
      })
      .end(),
  ];
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

  const prefix = existsSync(join(cwd, 'src')) ? join(cwd, 'src') : cwd;
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
          cacheDirectory:
            process.env.BABEL_CACHE !== 'none'
              ? winPath(`${prefix}/.umi/.cache/babel-loader`)
              : false,
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
              },
            ],
            ...(userConfig.extraBabelPresets || []).filter(Boolean),
          ],
          plugins: (userConfig.extraBabelPlugins || []).filter(Boolean),
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
