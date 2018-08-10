import assert from 'assert';

export default function(api) {
  api._registerConfig(() => {
    return () => {
      return {
        name: 'mountElementId',
        validate(val) {
          assert(
            typeof val === 'string',
            `mountElementId should be String, but got ${val}`,
          );
        },
        onChange() {
          api.restart();
        },
      };
    };
  });

  api.modifyDefaultConfig(memo => {
    memo.mountElementId = 'root';
    return memo;
  });
}
