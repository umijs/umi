
module.exports = (api) => {
  api.register({
    key: 'foo',
    fn: () => {
      return ['a'];
    },
  });
};
