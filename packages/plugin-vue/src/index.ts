import { IApi } from '@umijs/types';
import { dirname } from 'path';
import { VueLoaderPlugin } from 'vue-loader';

export default (api: IApi) => {
  api.describe({
    key: 'vue',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.chainWebpack((memo) => {
    // prettier-ignore
    memo.module
      .rule('vue')
      .test(/\.vue$/)
      .use('vue-loader')
        .loader(require.resolve('vue-loader'))
        .options({});
    memo.plugin('VueLoaderPlugin').use(VueLoaderPlugin);
    return memo;
  });

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'plugin-vue/App.vue',
      content: `
<template>
  <div>
    <h1>foo</h1>
    <router-link to="/">Home</router-link>
    <router-view />
    <h1>bar</h1>
  </div>
</template>
      `.trimStart(),
    });
  });

  api.modifyRendererPath(() => {
    return dirname(require.resolve('@umijs/renderer-vue/package.json'));
  });

  api.modifyDefaultConfig((memo) => {
    // 禁用 history 功能
    // @ts-ignore
    memo.history = false;
    return memo;
  });
};
