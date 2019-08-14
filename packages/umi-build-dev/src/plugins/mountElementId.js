import assert from 'assert';

export default function(api) {
  api._registerConfig(() => {
    return () => {
      return {
        name: 'mountElementId',
        validate(val) {
          assert(typeof val === 'string', `mountElementId should be String, but got ${val}`);
        },
        onChange() {
          api.restart();
        },
        group: 'basic',
        default: 'root',
        type: 'string',
        title: {
          'zh-CN': '根节点元素 ID',
          'en-US': 'Root Element ID',
        },
        description: {
          'zh-CN': '默认是 root，接老项目时才可能需要配。',
          'en-US': 'Default is root.',
        },
      };
    };
  });

  api.modifyDefaultConfig(memo => {
    memo.mountElementId = 'root';
    return memo;
  });
}
