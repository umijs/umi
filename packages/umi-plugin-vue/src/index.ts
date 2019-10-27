// import { compatDirname } from 'umi-utils';
import { join, dirname } from 'path';

const debug = require('debug')('umi-plugin-vue:index');

const defaultOpts = {
  vuex: {
    exclude: [],
    shouldImportDynamic: true,
    loading: {
      namespace: 'loadingStore',
      rootNamespace: 'rootStore',
    },
  },
  routes: {
    exclude: [/model/],
  },
};

function template(path) {
  return join(__dirname, '../template', path);
}

function getId(id) {
  return `umi-plugin-vue:${id}`;
}

export default function(api, options) {
  const option = {
    ...defaultOpts,
    ...options,
  };

  const { service, config, paths } = api;

  service.paths = {
    ...service.paths,
    defaultEntryTplPath: template('entry.js.mustache'),
    defaultRouterTplPath: template('router.js.mustache'),
    defaultDocumentPath: template('document.ejs'),
  };

  api.addVersionInfo([
    `vue@${require('vue/package').version}`,
    `vue-router@${require('vue-router/package').version}`,
    `vue-template-compiler@${require('vue-template-compiler/package').version}`,
    `vuex-plugin-loading@${require('vuex-plugin-loading/package').version}`,
  ]);

  api.modifyAFWebpackOpts(memo => {
    return {
      ...memo,
      alias: {
        ...(memo.alias || {}),
        'umi-vue/dynamic': require.resolve('umi-vue/lib/dynamic.js'),
        'umi-vue': require.resolve('umi-vue'),
        'vuex-plugin-loading': require.resolve('vuex-plugin-loading'),
        vue: require.resolve('vue/dist/vue.esm.js'),
        vuex: require.resolve('vuex/dist/vuex.esm.js'),
        'vue-router': require.resolve('vue-router/dist/vue-router.esm.js'),
      },
    };
  });

  const plugins = {
    routes: () => require('./plugins/routes').default,
    vuex: () => require('./plugins/vuex').default,
    'element-ui': () => require('./plugins/element-ui').default,
    dll: () => require('./plugins/dll').default,
  };

  api.registerGenerator('vue', {
    Generator: require('./generators/vue').default(api),
    resolved: join(__dirname, './generators/vue'),
  });

  api.registerPlugin({
    id: getId('vue'),
    apply: require('./plugins/vue').default,
  });

  Object.keys(plugins).forEach(key => {
    if (option[key]) {
      let opts = option[key];

      if (key === 'dll') {
        opts.include = (opts.include || []).concat(['vue', 'vuex', 'vue-router']);
      }

      api.registerPlugin({
        id: getId(key),
        apply: plugins[key](),
        opts,
      });
    }
  });
}
