import { existsSync } from 'fs';
import { join } from 'path';

export default function({ success, payload, api, lang, failure }) {
  const { item } = payload as {
    item: {
      features: string[];
    };
    type: string;
  };

  /**
   * 获取config 中 react 的判断
   * @param reactPlugin   reactPlugin<any>
   */
  function genReactPluginOpts(reactPlugin?: any) {
    if (reactPlugin && typeof reactPlugin !== 'string') {
      return reactPlugin[1];
    }
    return {};
  }

  /**
   * 是不是有这个 feature tag
   * @param feature
   */
  function haveFeature(feature) {
    return item.features && item.features.includes(feature);
  }

  if (!api.config.routes) {
    failure({
      message:
        lang === 'zh-CN'
          ? '区块添加暂不支持约定式路由，请先转成配置式路由。'
          : 'The block adding does not support the conventional route, please convert to a configuration route.',
    });
    return;
  }

  const payloadType = (payload as { type: string }).type === 'block' ? '区块' : '模板';
  const isBigfish = !!process.env.BIGFISH_COMPAT;
  const reactPlugin = (api.config.plugins || []).find(p => {
    return p === 'umi-plugin-react' || p[0] === 'umi-plugin-react';
  });
  const reactPluginOpts = genReactPluginOpts(reactPlugin);

  // 提前判断是否有 package.json，区块添加时如果没有会报错
  if (!existsSync(join(api.cwd, 'package.json'))) {
    failure({
      message:
        lang === 'zh-CN'
          ? `${payloadType}添加需要在项目根目录有 package.json`
          : `package.json is required to add ${payloadType}`,
    });
    return;
  }

  // antd 特性依赖
  // bigfish 默认开了 antd
  // if (haveFeature('antd') && !isBigfish) {
  //   if (!reactPlugin || !reactPluginOpts.antd) {
  //     failure({
  //       message:
  //         lang === 'zh-CN'
  //           ? `${payloadType}依赖 antd，请安装 umi-plugin-react 插件并开启 antd 。`
  //           : 'Block depends on antd, please install umi-plugin-react and enable antd.',
  //     });
  //     return;
  //   }
  // }

  // dva 特性依赖
  if (haveFeature('dva')) {
    if (isBigfish) {
      if (api.config.dva === false) {
        failure({
          message: `${payloadType}依赖 dva，请开启 dva 配置。`,
        });
        return;
      }
    } else if (!reactPlugin || !reactPluginOpts.dva) {
      failure({
        message:
          lang === 'zh-CN'
            ? `${payloadType}依赖 dva，请安装 umi-plugin-react 插件并开启 dva 。`
            : 'Block depends on dva, please install umi-plugin-react and enable dva.',
      });
      return;
    }
  }

  // locale 特性依赖
  if (haveFeature('i18n')) {
    if (isBigfish) {
      if (!api.config.locale) {
        failure({
          message: `${payloadType}依赖 locale，请开启 locale 配置。`,
        });
        return;
      }
    }
    if (!reactPlugin || !reactPluginOpts.locale) {
      failure({
        message:
          lang === 'zh-CN'
            ? `${payloadType}依赖国际化（i18n），请安装 umi-plugin-react 插件并开启 locale 。`
            : 'Block depends on i18n, please install umi-plugin-react and enable locale.',
      });
      return;
    }
  }
  success({ data: true, success: true });
}
