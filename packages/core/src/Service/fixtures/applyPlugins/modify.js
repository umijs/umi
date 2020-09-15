
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = function(api) {
  api.register({
    key: 'test',
    fn: (memo) => {
      return memo.concat('a');
    },
  });
  api.register({
    key: 'test',
    fn: async (memo) => {
      await delay(100);
      return memo.concat('b');
    },
  });
  api.register({
    key: 'test',
    fn: (memo) => {
      return memo.concat(['c', 'd']);
    },
  });
};
