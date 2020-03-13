
module.exports = (api) => {
  api.registerMethod({
    name: 'foo',
    fn() { return 'foo'; },
  });
};
