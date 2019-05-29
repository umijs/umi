import slash from 'slash';
import clonedeep from 'lodash.clonedeep';
import rimraf from 'rimraf';
import copy from 'copy';
import { join } from 'path';
import assert from 'assert';

import SafariNoModulePlugin, { safariFix } from './SafariNoModulePlugin';
import RecordChunks from './RecordChunksMap';

export default function(api, { isModernBuild = true, unsafeInline = false } = {}) {
  // Only suitable for production mode
  if (process.env.NODE_ENV !== 'production' || !isModernBuild) {
    return;
  }

  let leagcyWebpackConfig = null;
  let leagcyBabelModules = null;
  let record = null;
  let leagcyChunksMap = null;
  const { paths, _resolveDeps } = api;
  const leagcyOutputPath = join(paths.cwd, './.leagcy-dist');

  api.onStart(() => {
    const { treeShaking, minimizer } = api.config;
    assert(
      treeShaking === true,
      `treeShaking must be set to true when using umi-plugin-modern-mode`,
    );
    assert(
      minimizer === 'terserjs',
      `minimizer must be set to terserjs when using umi-plugin-modern-mode`,
    );
  });

  // run leagcy build before modern build
  api.beforeBuildCompileAsync(() => {
    rimraf.sync(leagcyOutputPath);
    const webpackConfig = leagcyWebpackConfig;
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line
      require(_resolveDeps('af-webpack/build')).default({
        webpackConfig,
        onSuccess() {
          console.log('[Leagcy] Build done');
          console.log();
          // eslint-disable-next-line
          const chunksToMap = require(_resolveDeps(
            './plugins/commands/build/chunksToMap.js',
          )).default(record.chunks);
          // eslint-disable-next-line
          leagcyChunksMap = require(_resolveDeps('./html/formatChunksMap.js')).default(chunksToMap); //eslint-disable-line
          resolve();
        },
        onFail({ err }) {
          reject(err);
        },
      });
    });
  });

  // 1. modify from base config to modern mode webpack config
  // 2. get leagcy webpack config
  api.modifyDefaultConfig(memo => {
    leagcyBabelModules = !!memo.treeShaking;

    return {
      ...memo,
      targets: {
        esmodules: true,
      },
    };
  });

  // add SafariNoModulePlugin
  api.chainWebpackConfig(config => {
    config.plugin('modern').use(SafariNoModulePlugin);
  });

  api.modifyWebpackConfig(config => {
    leagcyWebpackConfig = clonedeep(config);

    const { plugins, module } = leagcyWebpackConfig;

    // remove SafariNoModulePlugin
    plugins.pop();
    record = new RecordChunks();
    plugins.push(record);
    leagcyWebpackConfig.plugins = plugins;

    // fix babel
    const { rules = [] } = module;
    if (rules.length === 0) return;
    rules.forEach((rule, ruleIndex) => {
      const uses = rule.use || [];
      if (uses.length === 0) return;
      uses.forEach((item, itemIndex) => {
        if (slash(item.loader).indexOf('node_modules/babel-loader/lib/index.js') >= 0) {
          const { presets = [] } = item.options;
          if (presets.length === 0) return;
          presets.forEach((preset, presetIndex) => {
            const [presetPath, options] = preset;
            if (slash(presetPath).indexOf('node_modules/babel-preset-umi/lib/index.js') >= 0) {
              delete options.targets.esmodules;
              if (!leagcyBabelModules) {
                options.env.modules = 'commonjs';
              }
              rules[ruleIndex].use[itemIndex].options.presets[presetIndex].options = options;
            }
          });
        }
      });
    });

    leagcyWebpackConfig.module.rules = rules;

    leagcyWebpackConfig.entry = Object.keys(leagcyWebpackConfig.entry).reduce((prev, i) => {
      return {
        ...prev,
        [`${i}-leagcy`]: leagcyWebpackConfig.entry[i],
      };
    }, {});

    leagcyWebpackConfig.output.path = leagcyOutputPath;

    return config;
  });

  // copy leagcy js files to output
  api.onBuildSuccessAsync(() => {
    copy(`${leagcyOutputPath}/*.js`, paths.absOutputPath, () => {
      rimraf.sync(leagcyOutputPath);
    });
  });

  // modify from base html to modern mode
  // 1.1 insert header <link rel="modulepreload">
  api.addHTMLLink({
    href: 'modernModeUmi',
    rel: 'modulepreload',
    as: 'script',
    mod: 'modern',
  });

  // 1.2 insert footer
  api.addHTMLScript({
    src: 'modernModeUmi',
    type: 'module',
    mod: 'modern',
  });
  if (unsafeInline) {
    api.addHTMLScript({
      content: safariFix,
      mod: 'modern',
    });
  } else {
    api.addHTMLScript({
      src: '__PATH_TO_PUBLIC_PATH__safari-nomodule-fix.js',
      mod: 'modern',
    });
  }
  api.addHTMLScript({
    src: 'leagcyModeUmi',
    nomodule: 'nomodule',
    mod: 'modern',
  });

  // remove buildin script tag and remove attr 'mod'
  api.modifyHTMLWithAST(($, { getChunkPath }) => {
    $('link').each((i, el) => {
      const targetEl = $(el);
      if (targetEl.attr('mod') === 'modern') {
        targetEl.removeAttr('mod');
        if (targetEl.attr('href') === 'modernModeUmi') {
          targetEl.attr('href', `${getChunkPath('umi.js')}`);
        }
      }
    });
    $('script').each((i, el) => {
      const targetEl = $(el);
      if (targetEl.attr('mod') === 'modern') {
        targetEl.removeAttr('mod');
        if (targetEl.attr('src') === 'modernModeUmi') {
          targetEl.attr('src', `${getChunkPath('umi.js')}`);
        }
        if (targetEl.attr('src') === 'leagcyModeUmi') {
          targetEl.replaceWith(
            `<script src="__PATH_TO_PUBLIC_PATH__${
              leagcyChunksMap['umi-leagcy.js']
            }" nomodule></script>`,
          );
        }
      } else {
        targetEl.remove();
      }
    });
  });
}
