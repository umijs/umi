export default function(api) {
  api.registerCommand('test', {}, (args = {}) => {
    require('umi-test').default({
      ...args,
      watch: args.w || args.watch,
    });
  });
}
