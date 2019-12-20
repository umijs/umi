
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = function(api) {
  // sync
  api.register({
    key: 'test',
    fn: () => {
      return 'a';
    },
  });
  api.register({
    key: 'test',
    fn: async () => {
      await delay(100);
      return 'b';
    },
  });
  api.register({
    key: 'test',
    fn: () => {
      return ['c', 'd'];
    },
  });
};
