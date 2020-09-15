
module.exports = (api) => {
  api.register({
    key: 'count',
    fn() { return 'foo' },
  });
};
