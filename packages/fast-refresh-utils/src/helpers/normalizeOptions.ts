/**
 * Sets a constant default value for the property when it is undefined.
 * @template T
 * @template {keyof T} Property
 * @param {T} object An object.
 * @param {Property} property A property of the provided object.
 * @param {T[Property]} defaultValue The default value to set for the property.
 * @returns {T[Property]}
 */
const d = (object, property, defaultValue) =>
  object[property] === undefined ? defaultValue : object[property];

/**
 * Resolves the value for a nested object option.
 * @template T
 * @template Result
 * @param {T | undefined} value The option value.
 * @param {function(value: T | undefined): Result} fn The handler to resolve the option's value.
 * @returns {Result} The resolved option value.
 */
const nestedOption = (value, fn) => fn(value === undefined ? {} : value);

/**
 * Normalizes the options for the plugin.
 * @param {import('../types').ReactRefreshPluginOptions} options Non-normalized plugin options.
 * @returns {import('../types').NormalizedPluginOptions} Normalized plugin options.
 */
const normalizeOptions = (options) => {
  // Show deprecation notice and remove the option before any processing
  if (typeof options.disableRefreshCheck !== 'undefined') {
    console.warn(
      [
        'The "disableRefreshCheck" option has been deprecated and will not have any effect on how the plugin parses files.',
        'Please remove it from your configuration.',
      ].join(' '),
    );
  }

  return {
    type: d(options, 'type', 'react'),
    exclude: d(options, 'exclude', /node_modules/),
    forceEnable: options.forceEnable,
    include: d(options, 'include', /\.([jt]sx?|flow)$/),
    overlay: nestedOption(options.overlay, (overlay) => {
      /** @type {import('../types').NormalizedErrorOverlayOptions} */
      const defaults = {
        entry: require.resolve('../runtime/ErrorOverlayEntry'),
        module: require.resolve('../overlay'),
        sockIntegration: 'wds',
      };

      if (overlay === false) return false;
      if (overlay === true) return defaults;

      return {
        entry: d(overlay, 'entry', defaults.entry),
        module: d(overlay, 'module', defaults.module),
        sockHost: overlay.sockHost,
        sockIntegration: d(
          overlay,
          'sockIntegration',
          defaults.sockIntegration,
        ),
        sockPath: overlay.sockPath,
        sockPort: overlay.sockPort,
      };
    }),
    useLegacyWDSSockets: options.useLegacyWDSSockets,
  };
};

module.exports = normalizeOptions;
