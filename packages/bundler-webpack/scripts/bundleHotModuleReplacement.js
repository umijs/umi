
(async () => {
  await require('esbuild').build({
    entryPoints: {
      hotModuleReplacement:
        './src/webpack/plugins/mini-css-extract-plugin/src/hmr/hotModuleReplacement',
    },
    external: ['punycode'],
    platform: "browser",
    format: "cjs",
    outdir: './bundled/css/',
    bundle: true,
    minify: false,
  })
})();
