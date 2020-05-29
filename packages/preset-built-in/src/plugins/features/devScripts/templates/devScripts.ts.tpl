{{#FAST_REFRESH}}
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  const Refresh = require('{{{ RefreshRuntimePath }}}');

  // Inject refresh runtime into global
  Refresh.injectIntoGlobalHook(window);

  // Setup placeholder functions
  window.$RefreshReg$ = function () {};
  window.$RefreshSig$ = function () {
    return function (type) {
      return type;
    };
  };

  /**
   * Setup module refresh.
   * @param {number} moduleId An ID of a module.
   * @returns {function(): void} A function to restore handlers to their previous state.
   */
  window.$RefreshSetup$ = function setupModuleRefresh(moduleId) {
    // Capture previous refresh state
    const prevRefreshReg = window.$RefreshReg$;
    const prevRefreshSig = window.$RefreshSig$;

    /**
     * Registers a refresh to react-refresh.
     * @param {string} [type] A valid type of a module.
     * @param {number} [id] An ID of a module.
     * @returns {void}
     */
    window.$RefreshReg$ = function (type, id) {
      const typeId = moduleId + ' ' + id;
      Refresh.register(type, typeId);
    };

    /**
     * Creates a module signature function from react-refresh.
     * @returns {function(type: string): string} A created signature function.
     */
    window.$RefreshSig$ = Refresh.createSignatureFunctionForTransform;

    // Restore to previous refresh functions after initialization
    return function cleanup() {
      window.$RefreshReg$ = prevRefreshReg;
      window.$RefreshSig$ = prevRefreshSig;
    };
  };
}
{{/FAST_REFRESH}}

/**
 * first loaded, aim to handle HMR change for last step(after rerender and fast refresh failed)
 */
if (window.g_initWebpackHotDevClient) {
  function tryApplyUpdates(onHotUpdateSuccess?: Function) {
    // @ts-ignore
    if (!module.hot) {
      window.location.reload();
      return;
    }

    function isUpdateAvailable() {
      // @ts-ignore
      return window.g_getMostRecentCompilationHash() !== __webpack_hash__;
    }

    // TODO: is update available?
    // @ts-ignore
    if (!isUpdateAvailable() || module.hot.status() !== 'idle') {
      return;
    }

    function handleApplyUpdates(err: Error | null, updatedModules: any) {
      const fastRefresh = {{{FAST_REFRESH}}};
      const forcedReload = err || !updatedModules || window.g_getHadRuntimeError();
      if (!fastRefresh && forcedReload) {
        // the final step if not hot reload work
        window.location.reload();
        return;
      }

      onHotUpdateSuccess?.();

      if (isUpdateAvailable()) {
        // While we were updating, there was a new update! Do it again.
        tryApplyUpdates();
      }
    }

    // @ts-ignore
    module.hot.check(true).then(
      function (updatedModules: any) {
        handleApplyUpdates(null, updatedModules);
      },
      function (err: Error) {
        handleApplyUpdates(err, null);
      },
    );
  }

  window.g_initWebpackHotDevClient({
    tryApplyUpdates,
  });
}
