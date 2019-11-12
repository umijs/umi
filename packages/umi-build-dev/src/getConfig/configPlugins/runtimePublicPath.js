import assert from 'assert';

export default function(api) {
  return {
    name: 'runtimePublicPath',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `Configure item runtimePublicPath should be Boolean, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Configure item runtimePublicPath Changed.');
    },
    default: false,
    title: {
      'zh-CN': '启用运行时 publicPath',
      'en-US': 'Enable Runtime publicPath',
    },
    description: {
      'zh-CN': '使用 HTML 里指定的 window.publicPath 作为动态加载资源的查找起点。',
      'en-US': 'Whether to use the window.publicPath specified in the HTML.',
    },
    type: 'boolean',
    group: 'deploy',
  };
}
