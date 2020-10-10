
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = function(api) {
  api.registerMethod({
    name: 'foo',
  });

  api.foo(() => {
    return 'a';
  });
  api.foo({
    fn: async () => {
      return 'b';
    },
    stage: 1000,
  });
  api.foo({
    fn: () => {
      return 'c';
    },
    stage: -1,
  });
  api.foo({
    fn: () => {
      return 'd';
    },
  });
  api.foo({
    fn: () => {
      return 'e';
    },
  });
};
