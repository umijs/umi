import assert from 'assert';

const blacklist = ['/src', '/public', '/pages', '/mock', '/config'];

export default function() {
  return {
    name: 'outputPath',
    validate(val) {
      assert(
        typeof val === 'string',
        `Configure item outputPath should be String, but got ${val}.`,
      );
      assert(
        !blacklist.includes(val.slice(0) === '/' ? val : `/${val}`),
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
