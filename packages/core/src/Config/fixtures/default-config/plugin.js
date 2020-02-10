
module.exports = (api) => {
  api.describe({
    key: 'plugin',
    config: {
      default: {
        foo: 'foo',
      },
      schema(joi) {
        return joi.object();
      },
    },
  });

  api.modifyDefaultConfig(memo => {
    memo.plugin.foo += '-bar';
    return memo;
  });

  api.modifyConfig(memo => {
    memo.plugin.hoo = 'hoo';
    return memo;
  })
};
