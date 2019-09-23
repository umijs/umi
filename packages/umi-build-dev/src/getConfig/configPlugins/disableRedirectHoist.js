import assert from 'assert';

export default function(api) {
  return {
    name: 'disableRedirectHoist',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `Configure item disableRedirectHoist should be Boolean, but got ${val.toString()}.`,
      );
    },
    onChange() {
      api.service.rebuildTmpFiles();
    },
    group: 'route',
    type: 'boolean',
    default: false,
    title: {
      'zh-CN': '禁用 Redirect 前置',
      'en-US': 'Disable Redirect Hoist',
    },
    description: {
      'zh-CN':
        '路由默认会把所有 redirect 提到路由最前面，如果遇到相关匹配问题，可通过此配置项禁用。',
      'en-US':
        'We hoist all redirect when parsing the route config, use this config when you have related match problem.',
    },
  };
}
