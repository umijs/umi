
export default {
  ssr: true,
  disableCSSModules: true,
  cssModulesWithAffix: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  // for test
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (
      context,
      localIdentName,
      localName,
    ) => {
      return localName;
    },
  }
}
