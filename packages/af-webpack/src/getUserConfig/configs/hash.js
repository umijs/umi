import assert from 'assert';

export default function() {
  return {
    name: 'hash',
    validate(val) {
      assert(typeof val === 'boolean', `The hash config must be Boolean, but got ${val}`);
    },
    default: false,
    group: 'deploy',
    title: {
      'zh-CN': '启用 Hash 文件名',
      'en-US': 'Use Hash Filename',
    },
    type: 'boolean',
    description: {
      'zh-CN': '比如：之前是 dist/umi.js，启用后变成 dist/umi.xxxxx.js 。',
      'en-US': 'Whether to enable the hash file suffix.',
    },
  };
}
