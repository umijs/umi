export default function(api) {
  api.register('modifyAFWebpackOpts', ({ memo }) => {
    return {
      ...memo,
      disableDynamicImport: false,
    };
  });
}
