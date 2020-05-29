const path = require('path');
const webpack = require('webpack');
const {
  createRefreshTemplate,
  injectRefreshEntry,
  normalizeOptions,
} = require('./helpers');
const { refreshUtils } = require('./runtime/globals');

export default class ReactRefreshPlugin {
  /**
   * @param {import('./types').ReactRefreshPluginOptions} [options] Options for react-refresh-plugin.
   */
  constructor(options = {}) {
    /**
     * @readonly
     * @type {import('./types').NormalizedPluginOptions}
     */
    this.options = normalizeOptions(options);
  }

  /**
   * Applies the plugin.
   * @param {import('webpack').Compiler} compiler A webpack compiler object.
   * @returns {void}
   */
  apply(compiler) {
    // Skip processing on non-development mode, but allow manual force-enabling
    if (
      // Webpack do not set process.env.NODE_ENV, so we need to check for mode.
      // Ref: https://github.com/webpack/webpack/issues/7074
      (compiler.options.mode !== 'development' ||
        // We also check for production process.env.NODE_ENV,
        // in case it was set and mode is non-development (e.g. 'none')
        (process.env.NODE_ENV && process.env.NODE_ENV === 'production')) &&
      !this.options.forceEnable
    ) {
      return;
    }

    // Inject react-refresh context to all Webpack entry points
    compiler.options.entry = injectRefreshEntry(
      compiler.options.entry,
      this.options,
    );

    // Inject necessary modules to Webpack's global scope
    const providePlugin = new webpack.ProvidePlugin({
      [refreshUtils]: require.resolve('./runtime/refreshUtils'),
    });
    providePlugin.apply(compiler);

    compiler.hooks.beforeRun.tap(this.constructor.name, (compiler) => {
      // Check for existence of HotModuleReplacementPlugin in the plugin list
      // It is the foundation to this plugin working correctly
      if (
        !compiler.options.plugins ||
        !compiler.options.plugins.find(
          // It's validated with the name rather than the constructor reference
          // because a project might contain multiple references to Webpack
          (plugin) => plugin.constructor.name === 'HotModuleReplacementPlugin',
        )
      ) {
        throw new Error(
          'Hot Module Replacement (HMR) is not enabled! React-refresh requires HMR to function properly.',
        );
      }
    });

    const matchObject = webpack.ModuleFilenameHelpers.matchObject.bind(
      undefined,
      this.options,
    );
    compiler.hooks.normalModuleFactory.tap(this.constructor.name, (nmf) => {
      nmf.hooks.afterResolve.tap(this.constructor.name, (data) => {
        // Inject refresh loader to all JavaScript-like files
        if (
          // Include and exclude user-specified files
          matchObject(data.resource) &&
          // Skip files related to the plugin's runtime to prevent self-referencing.
          // This is particularly useful when using the plugin as a direct dependency.
          !data.resource.includes(path.join(__dirname, './runtime'))
        ) {
          data.loaders.unshift({
            loader: require.resolve('./loader'),
            options: undefined,
          });
        }

        return data;
      });
    });

    compiler.hooks.compilation.tap(this.constructor.name, (compilation) => {
      compilation.mainTemplate.hooks.require.tap(
        this.constructor.name,
        // Constructs the correct module template for react-refresh
        (source, chunk, hash) => {
          const mainTemplate = compilation.mainTemplate;

          // Check for the output filename
          // This is to ensure we are processing a JS-related chunk
          let filename = mainTemplate.outputOptions.filename;
          if (typeof filename === 'function') {
            // Only usage of the `chunk` property is documented by Webpack.
            // However, some internal Webpack plugins uses other properties,
            // so we also pass them through to be on the safe side.
            filename = filename({
              chunk,
              hash,
              //  TODO: Figure out whether we need to stub the following properties, probably no
              contentHashType: 'javascript',
              hashWithLength: (length) =>
                mainTemplate.renderCurrentHashCode(hash, length),
              noChunkHash: mainTemplate.useChunkHash(chunk),
            });
          }

          // Check whether the current compilation is outputting to JS,
          // since other plugins can trigger compilations for other file types too.
          // If we apply the transform to them, their compilation will break fatally.
          // One prominent example of this is the HTMLWebpackPlugin.
          // If filename is falsy, something is terribly wrong and there's nothing we can do.
          if (!filename || !filename.includes('.js')) {
            return source;
          }

          return createRefreshTemplate(source);
        },
      );
    });
  }
}
