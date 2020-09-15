
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = function(api) {
  api.register({
    key: 'test',
    fn: (args) => {
      args.increase(1);
    },
  });
  api.register({
    key: 'test',
    fn: async (args) => {
      await delay(100);
      args.increase(2);
    },
  });
};
