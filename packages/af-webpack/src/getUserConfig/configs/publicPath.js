import assert from 'assert';

export default function() {
  return {
    name: 'publicPath',
    validate(val) {
      assert(typeof val === 'string', `The publicPath config must be String, but got ${val}.`);
      assert(val.endsWith('/'), `The publicPath config must ends with /.`);
    },
    default: '/',
    title: 'publicPath',
    type: 'string',
    group: 'deploy',
    description: {
      'zh-CN': '指定 webpack 的 publicPath 配置，指向发布后的静态资源位置，dev 时无效。',
      'en-US': 'The publicPath of your assets.',
    },
  };
}
