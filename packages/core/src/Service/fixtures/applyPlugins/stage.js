
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = function(api) {
  api.register({
    key: 'test',
    fn: () => {
      return 'a';
    },
  });
  api.register({
    key: 'test',
    fn: async () => {
      return 'b';
    },
    stage: 1000,
  });
  api.register({
    key: 'test',
    fn: () => {
      return 'c';
    },
    stage: -1,
  });
  api.register({
    key: 'test',
    fn: () => {
      return 'd';
    },
  });
  api.register({
    key: 'test',
    fn: () => {
      return 'e';
    },
  });
};
