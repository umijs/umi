
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = (api) => {
  api.registerCommand({
    name: 'build',
    fn: async () => {
      await delay(100);
      return `hello ${api.args.projectName}`;
    },
  });
};
