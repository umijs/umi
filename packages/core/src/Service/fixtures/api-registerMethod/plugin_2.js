
module.exports = (api) => {
  api.registerMethod({
    name: 'bar',
    fn() { return 'bar'; },
  });
};
