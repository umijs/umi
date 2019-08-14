import assert from 'assert';

export default function(api) {
  return {
    name: 'treeShaking',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `Configure item treeShaking should be Boolean, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Configure item treeShaking Changed.');
    },
    default: false,
    type: 'boolean',
    group: 'webpack',
    title: {
      'zh-CN': '启用 Tree Shaking',
      'en-US': 'Enable Tree Shaking',
    },
    description: {
      'zh-CN': '开启 Tree Shaking 能让项目打包尺寸更小。',
      'en-US': 'Enable Tree Shaking can make your project smaller.',
    },
  };
}
