
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = (api) => {
  api.registerCommand({
    name: 'build',
    alias: 'b',
    fn: async ({ args }) => {
      await delay(100);
      return `hello ${args.projectName}`;
    },
  });
};
