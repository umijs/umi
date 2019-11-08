import assert from 'assert';

const blacklist = ['src', 'public', 'pages', 'page', 'mock', 'config'];

export default function() {
  return {
    name: 'outputPath',
    validate(val) {
      assert(
        typeof val === 'string',
        `Configure item outputPath should be String, but got ${val}.`,
      );

      // 可能有 break change，等 umi@3
      // assert(!val.startsWith('/'), `The outputPath config should not start with '/'`);

      assert(
        !blacklist.includes(val),
        `The outputPath config is not allowed to be set to ${val}, ${val} is convention directory`,
      );
    },
    group: 'deploy',
    type: 'string',
    default: './dist',
    title: {
      'zh-CN': '输出路径',
      'en-US': 'Output Path',
    },
    description: {
      'zh-CN': '指定输出路径，默认是 ./dist 。',
      'en-US': 'Specify the output path.',
    },
  };
}
