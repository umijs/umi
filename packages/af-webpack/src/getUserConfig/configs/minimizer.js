import assert from 'assert';

export default function() {
  return {
    name: 'minimizer',
    validate(val) {
      assert(
        val === 'terserjs' || val === 'uglifyjs',
        `minimizer should be terserjs or uglifyjs, but got ${val}`,
      );
    },
    group: 'webpack',
    default: 'uglifyjs',
    type: 'list',
    choices: ['terserjs', 'uglifyjs'],
    title: {
      'zh-CN': '压缩器',
      'en-US': 'Minimizer',
    },
    description: {
      'zh-CN': '使用 terserjs 压缩时有 es6 语法不会报错。',
      'en-US': 'There is no error with es6 syntax when compressing with terserjs.',
    },
  };
}
