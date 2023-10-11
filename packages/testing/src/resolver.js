/*
* reference: https://jestjs.io/docs/configuration#resolver-string
*
* */
module.exports = (path, options) => {
  // Call the defaultResolver, so we leverage its cache, error handling, etc.
  return options.defaultResolver(path, {
    ...options,
    // Use packageFilter to process parsed `package.json` before the resolution (see https://www.npmjs.com/package/resolve#resolveid-opts-cb)
    packageFilter: pkg => {
      return {
        ...pkg,
        main: pkg.main || pkg.module,
      };
    },
  });
};
