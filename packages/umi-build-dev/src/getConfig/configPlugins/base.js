import assert from 'assert';

export default function(api) {
  return {
    name: 'base',
    validate(val) {
      assert(typeof val === 'string', `Configure item base should be String, but got ${val}`);
    },
    onChange() {
      api.service.restart(/* why */ 'Config base Changed');
    },
    group: 'route',
    type: 'string',
    default: '/',
    title: {
      'zh-CN': '路由 Base',
      'en-US': 'Route Base',
    },
    description: {
      'zh-CN':
        '指定 react-router 的 base 属性，决定路由从 URL 的哪层路径开始计算，部署到非根目录时有用。',
      'en-US':
        'Specify the base of the react-router to be configured when deploying to a non-root directory.',
    },
  };
}
