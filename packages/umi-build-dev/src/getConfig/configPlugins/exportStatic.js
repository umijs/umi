import assert from 'assert';
import { isPlainObject } from 'lodash';

export default function(api) {
  return {
    name: 'exportStatic',
    validate(val) {
      assert(
        isPlainObject(val) || typeof val === 'boolean',
        `Configure item exportStatic should be Boolean or Plain Object, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Config exportStatic Changed');
    },
    configs: [
      {
        group: 'deploy',
        name: 'exportStatic',
        title: {
          'zh-CN': '导出静态文件',
          'en-US': 'Export Static Files',
        },
        description: {
          'zh-CN': '针对每个路由生成一份 HTML 文件。',
          'en-US': 'Generate HTML files for every route.',
        },
        type: 'boolean',
        default: false,
      },
      {
        group: 'deploy',
        name: 'exportStatic.htmlSuffix',
        title: {
          'zh-CN': '使用 .html 后缀',
          'en-US': 'Use .html Suffix',
        },
        description: {
          'zh-CN': '生成的 HTML 文件是以 路由.html 结尾，而不是 路由/index.html 的形式。',
          'en-US': 'Generated HTML files is ended with route.html .',
        },
        type: 'boolean',
        default: false,
      },
      {
        group: 'deploy',
        name: 'exportStatic.dynamicRoot',
        title: {
          'zh-CN': '允许部署到任意路径',
          'en-US': 'Allow to deploy to any path',
        },
        description: {
          'zh-CN': '适用于不能确定部署环境的场景，动态获取 base 和 publicPath。',
          'en-US':
            'Applies to scenarios where the deployment environment cannot be determined, dynamically obtaining base and publicPath.',
        },
        type: 'boolean',
        default: false,
      },
    ],
  };
}
