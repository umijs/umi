export default function(api) {
  const {
    config: { react = {} },
  } = api.service;

  if (react.dynamicImport) {
    api.register('modifyAFWebpackOpts', ({ memo }) => {
      return {
        ...memo,
        disableDynamicImport: false,
      };
    });
  }
}
